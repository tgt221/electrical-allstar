param([int]$Port = 8321)

$root = $PSScriptRoot
$mime = @{
  ".html"="text/html; charset=utf-8"; ".css"="text/css; charset=utf-8"
  ".js"="application/javascript; charset=utf-8"; ".jpg"="image/jpeg"; ".jpeg"="image/jpeg"
  ".png"="image/png"; ".webp"="image/webp"; ".svg"="image/svg+xml"; ".ico"="image/x-icon"
  ".json"="application/json"; ".woff"="font/woff"; ".woff2"="font/woff2"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$Port/"

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $reqPath = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
    if ([string]::IsNullOrWhiteSpace($reqPath)) { $reqPath = "index.html" }
    $file = Join-Path $root $reqPath
    $fullRoot = [System.IO.Path]::GetFullPath($root)
    $fullFile = [System.IO.Path]::GetFullPath($file)
    if ($fullFile.StartsWith($fullRoot) -and (Test-Path $fullFile -PathType Leaf)) {
      $bytes = [System.IO.File]::ReadAllBytes($fullFile)
      $ext = [System.IO.Path]::GetExtension($fullFile).ToLower()
      $ctx.Response.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
      $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
    }
    $ctx.Response.Close()
  } catch {
    if (-not $listener.IsListening) { break }
  }
}
