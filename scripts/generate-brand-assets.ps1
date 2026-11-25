$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$brand = Join-Path $root 'assets\brand'
$source = [System.Drawing.Bitmap]::FromFile((Join-Path $brand 'logo.jpeg'))

try {
    $tree = [System.Drawing.Bitmap]::new(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $crop = [System.Drawing.Rectangle]::new(214, 185, 212, 166)
    for ($y = 0; $y -lt $tree.Height; $y++) {
        for ($x = 0; $x -lt $tree.Width; $x++) {
            $sx = $crop.X + [Math]::Min($crop.Width - 1, [int]($x * $crop.Width / $tree.Width))
            $sy = $crop.Y + [Math]::Min($crop.Height - 1, [int]($y * $crop.Height / $tree.Height))
            $pixel = $source.GetPixel($sx, $sy)
            $brightness = ($pixel.R + $pixel.G + $pixel.B) / 3
            $alpha = [int][Math]::Max(0, [Math]::Min(255, ($brightness - 20) * 255 / 170))
            $tree.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 245, 239, 229))
        }
    }
    $tree.Save((Join-Path $brand 'tree.png'), [System.Drawing.Imaging.ImageFormat]::Png)

    # Extract the complete original mark, including its custom ARVO lettering.
    $mark = [System.Drawing.Bitmap]::new(750, 500, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $markCrop = [System.Drawing.Rectangle]::new(135, 183, 375, 250)
    for ($y = 0; $y -lt $mark.Height; $y++) {
        for ($x = 0; $x -lt $mark.Width; $x++) {
            $sx = $markCrop.X + [Math]::Min($markCrop.Width - 1, [int]($x * $markCrop.Width / $mark.Width))
            $sy = $markCrop.Y + [Math]::Min($markCrop.Height - 1, [int]($y * $markCrop.Height / $mark.Height))
            $pixel = $source.GetPixel($sx, $sy)
            $brightness = ($pixel.R + $pixel.G + $pixel.B) / 3
            $alpha = [int][Math]::Max(0, [Math]::Min(255, ($brightness - 20) * 255 / 170))
            $mark.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 245, 239, 229))
        }
    }
    $mark.Save((Join-Path $brand 'full-logo.png'), [System.Drawing.Imaging.ImageFormat]::Png)

    $card = [System.Drawing.Bitmap]::new(1200, 630)
    $g = [System.Drawing.Graphics]::FromImage($card)
    try {
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $background = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
            [System.Drawing.Point]::new(0, 0), [System.Drawing.Point]::new(1200, 630),
            [System.Drawing.Color]::FromArgb(15, 27, 20), [System.Drawing.Color]::FromArgb(30, 55, 39))
        $g.FillRectangle($background, 0, 0, 1200, 630)
        $background.Dispose()

        $line = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(24, 191, 211, 166), 1)
        for ($x = 65; $x -lt 1200; $x += 88) { $g.DrawLine($line, $x, 0, $x, 630) }
        for ($y = 50; $y -lt 630; $y += 88) { $g.DrawLine($line, 0, $y, 1200, $y) }
        $line.Dispose()
        foreach ($radius in @(250, 350, 470, 600)) {
            $ring = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(39, 183, 207, 145), 1)
            $g.DrawEllipse($ring, 940 - $radius, 290 - $radius, 2 * $radius, 2 * $radius)
            $ring.Dispose()
        }
        $accent = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(197, 211, 157))
        $cream = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(245, 239, 229))
        $muted = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(187, 198, 181))
        $g.DrawImage($mark, [System.Drawing.Rectangle]::new(400, 62, 400, 267))
        $center = [System.Drawing.StringFormat]::new()
        $center.Alignment = [System.Drawing.StringAlignment]::Center
        $headingFont = [System.Drawing.Font]::new('Segoe UI', 48, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
        $bodyFont = [System.Drawing.Font]::new('Segoe UI', 26, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
        $labelFont = [System.Drawing.Font]::new('Segoe UI', 20, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
        $g.DrawString('ESTÚDIO DE NEGÓCIOS', $labelFont, $accent, [System.Drawing.RectangleF]::new(0, 350, 1200, 32), $center)
        $g.DrawString('Estratégia que ganha forma.', $headingFont, $cream, [System.Drawing.RectangleF]::new(0, 396, 1200, 62), $center)
        $g.DrawString('Negócios que avançam.', $headingFont, $accent, [System.Drawing.RectangleF]::new(0, 452, 1200, 62), $center)
        $g.DrawString('Estratégia  ·  Comercial  ·  Tecnologia', $bodyFont, $muted, [System.Drawing.RectangleF]::new(0, 559, 1200, 40), $center)
        $card.Save((Join-Path $brand 'social-preview.png'), [System.Drawing.Imaging.ImageFormat]::Png)
        $center.Dispose(); $headingFont.Dispose(); $bodyFont.Dispose(); $labelFont.Dispose()
        $accent.Dispose(); $cream.Dispose(); $muted.Dispose()
    } finally { $g.Dispose(); $card.Dispose(); $mark.Dispose() }
} finally { $tree.Dispose(); $source.Dispose() }
