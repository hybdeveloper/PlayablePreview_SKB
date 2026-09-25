# Local dev server for Windows machines without Node.js.
# Same behaviour as scripts/serve.js (manifest rebuilt on every request).
# Usage:  powershell -ExecutionPolicy Bypass -File scripts\serve.ps1 [-Port 5173]
param([int]$Port = 5173)
$ErrorActionPreference = 'Stop'

$Root  = Split-Path -Parent $PSScriptRoot
$Site  = Join-Path $Root 'site'
$Games = Join-Path $Root 'games'

$HtmlExt    = '.html', '.htm'
$ImgExt     = '.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'
$ThumbNames = 'thumbnail', 'thumb', 'icon', 'cover', 'preview'
$Mime = @{
  '.html' = 'text/html; charset=utf-8'; '.htm' = 'text/html; charset=utf-8'
  '.js' = 'text/javascript; charset=utf-8'; '.mjs' = 'text/javascript; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'; '.json' = 'application/json; charset=utf-8'
  '.svg' = 'image/svg+xml'; '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'
  '.gif' = 'image/gif'; '.webp' = 'image/webp'; '.ico' = 'image/x-icon'
  '.mp3' = 'audio/mpeg'; '.ogg' = 'audio/ogg'; '.wav' = 'audio/wav'; '.m4a' = 'audio/mp4'
  '.mp4' = 'video/mp4'; '.webm' = 'video/webm'; '.wasm' = 'application/wasm'
  '.woff' = 'font/woff'; '.woff2' = 'font/woff2'; '.ttf' = 'font/ttf'; '.otf' = 'font/otf'
}

function Get-Ms($dt) { ([DateTimeOffset]$dt.ToUniversalTime()).ToUnixTimeMilliseconds() }
function Test-Hidden($name) { $name.StartsWith('.') -or $name.StartsWith('_') -or $name -eq 'node_modules' }

$script:count = 0
$script:owners = $null

# Uploader of a game file, from .pp-owners.json next to games/ (see scripts/manifest.js).
function Add-Owner($node, $key) {
  if ($script:owners -and $script:owners.PSObject.Properties[$key]) { $node.owner = [string]$script:owners.PSObject.Properties[$key].Value }
}

function Read-GameFolder($dir, $rel) {
  $files = @(Get-ChildItem -LiteralPath $dir.FullName -Recurse -File -Force)
  $size = [long]0; $mod = [long]0
  foreach ($f in $files) { $size += $f.Length; $m = Get-Ms $f.LastWriteTimeUtc; if ($m -gt $mod) { $mod = $m } }
  $node = [ordered]@{ type = 'game'; kind = 'folder'; name = $dir.Name; title = $dir.Name; path = $rel; entry = "$rel/index.html"; size = $size; modified = $mod }
  $thumb = Get-ChildItem -LiteralPath $dir.FullName -File | Where-Object { ($ImgExt -contains $_.Extension.ToLower()) -and ($ThumbNames -contains $_.BaseName.ToLower()) } | Select-Object -First 1
  if ($thumb) { $node.thumb = "$rel/$($thumb.Name)" }
  Add-Owner $node "$rel/index.html"
  $metaPath = Join-Path $dir.FullName 'playable.json'
  if (Test-Path -LiteralPath $metaPath) {
    try {
      $meta = [IO.File]::ReadAllText($metaPath) | ConvertFrom-Json
      if ($meta.title) { $node.title = $meta.title }
      if ($meta.orientation) { $node.orientation = $meta.orientation }
      if ($meta.description) { $node.description = $meta.description }
    } catch { }
  }
  $script:count++
  $node
}

function Read-GameFile($file, $rel, $siblings) {
  $node = [ordered]@{ type = 'game'; kind = 'file'; name = $file.Name; title = $file.BaseName; path = $rel; entry = $rel; size = [long]$file.Length; modified = (Get-Ms $file.LastWriteTimeUtc) }
  $thumb = $siblings | Where-Object { ($ImgExt -contains $_.Extension.ToLower()) -and ($_.BaseName -ceq $file.BaseName) } | Select-Object -First 1
  if ($thumb) {
    $dir = if ($rel.Contains('/')) { $rel.Substring(0, $rel.LastIndexOf('/') + 1) } else { '' }
    $node.thumb = $dir + $thumb.Name
  }
  Add-Owner $node $rel
  $script:count++
  $node
}

function Read-Folder($dirPath, $rel, $name) {
  $children = New-Object System.Collections.ArrayList
  $entries = @(Get-ChildItem -LiteralPath $dirPath -Force | Where-Object { -not (Test-Hidden $_.Name) })
  $siblings = @($entries | Where-Object { -not $_.PSIsContainer })
  foreach ($e in $entries) {
    $eRel = if ($rel) { "$rel/$($e.Name)" } else { $e.Name }
    if ($e.PSIsContainer) {
      if (Test-Path -LiteralPath (Join-Path $e.FullName 'index.html')) { [void]$children.Add((Read-GameFolder $e $eRel)) }
      else { [void]$children.Add((Read-Folder $e.FullName $eRel $e.Name)) }
    } elseif ($HtmlExt -contains $e.Extension.ToLower()) {
      [void]$children.Add((Read-GameFile $e $eRel $siblings))
    }
  }
  $size = [long]0; $mod = [long]0
  foreach ($c in $children) { $size += $c.size; if ($c.modified -gt $mod) { $mod = $c.modified } }
  if (-not $mod) { $mod = Get-Ms (Get-Item -LiteralPath $dirPath).LastWriteTimeUtc }
  [ordered]@{ type = 'folder'; name = $name; title = $name; path = $rel; size = $size; modified = $mod; children = $children }
}

function Get-Manifest {
  if (-not (Test-Path -LiteralPath $Games)) { New-Item -ItemType Directory -Path $Games | Out-Null }
  $script:count = 0
  $script:owners = $null
  $ownersPath = Join-Path $Root '.pp-owners.json'
  if (Test-Path -LiteralPath $ownersPath) { try { $script:owners = [IO.File]::ReadAllText($ownersPath) | ConvertFrom-Json } catch { } }
  $tree = Read-Folder $Games '' 'Playables'
  $m = [ordered]@{ generatedAt = (Get-Ms (Get-Date)); count = $script:count; root = $tree }
  ConvertTo-Json $m -Depth 60 -Compress
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Playable Preview running:  http://localhost:$Port   (Ctrl+C to stop)"

try {
  while ($listener.IsListening) {
    $task = $listener.GetContextAsync()
    while (-not $task.AsyncWaitHandle.WaitOne(250)) { }
    $ctx = $task.GetAwaiter().GetResult()
    $res = $ctx.Response
    try {
      $res.Headers.Add('Cache-Control', 'no-store')
      $p = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
      if ($p -eq '/manifest.json') {
        $bytes = [Text.Encoding]::UTF8.GetBytes((Get-Manifest))
        $res.ContentType = $Mime['.json']
      } else {
        if ($p.StartsWith('/games/')) { $base = $Games; $rel = $p.Substring(7) } else { $base = $Site; $rel = $p.TrimStart('/') }
        $full = [IO.Path]::GetFullPath([IO.Path]::Combine($base, $rel.Replace('/', '\')))
        if (-not $full.StartsWith($base)) { $res.StatusCode = 403; $bytes = [byte[]]@() }
        else {
          if ([IO.Directory]::Exists($full)) { $full = Join-Path $full 'index.html' }
          if ([IO.File]::Exists($full)) {
            $bytes = [IO.File]::ReadAllBytes($full)
            $ext = [IO.Path]::GetExtension($full).ToLower()
            $res.ContentType = if ($Mime.ContainsKey($ext)) { $Mime[$ext] } else { 'application/octet-stream' }
          } else { $res.StatusCode = 404; $bytes = [Text.Encoding]::UTF8.GetBytes('Not found') }
        }
      }
      $res.ContentLength64 = $bytes.Length
      if ($bytes.Length) { $res.OutputStream.Write($bytes, 0, $bytes.Length) }
    } catch {
      Write-Warning $_
      try { $res.StatusCode = 500 } catch { }
    } finally { $res.Close() }
  }
} finally { $listener.Stop() }
