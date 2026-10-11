import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

// Production export only: preserve generated artwork, clip its empty outer
// margin to a regular app tile, and make the white tile fully opaque.
guard CommandLine.arguments.count == 3 else {
    fatalError("Usage: swift export-icon.swift INPUT.png OUTPUT.png")
}
let input = URL(fileURLWithPath: CommandLine.arguments[1])
let output = URL(fileURLWithPath: CommandLine.arguments[2])
guard let source = CGImageSourceCreateWithURL(input as CFURL, nil),
      let image = CGImageSourceCreateImageAtIndex(source, 0, nil),
      image.width == image.height,
      let space = CGColorSpace(name: CGColorSpace.sRGB),
      let context = CGContext(data: nil, width: image.width, height: image.height,
                              bitsPerComponent: 8, bytesPerRow: image.width * 4,
                              space: space, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)
else { fatalError("Cannot read square image or allocate RGBA canvas") }
let side = CGFloat(image.width)
let inset = side * 0.05
let tile = CGRect(x: inset, y: inset, width: side - 2 * inset, height: side - 2 * inset)
let radius = side * 0.18
context.setShouldAntialias(true)
context.addPath(CGPath(roundedRect: tile, cornerWidth: radius, cornerHeight: radius, transform: nil))
context.clip()
context.setFillColor(CGColor(colorSpace: space, components: [1, 1, 1, 1])!)
context.fill(tile)
context.interpolationQuality = .high
context.draw(image, in: CGRect(x: 0, y: 0, width: side, height: side))
guard let rendered = context.makeImage(),
      let destination = CGImageDestinationCreateWithURL(output as CFURL, UTType.png.identifier as CFString, 1, nil)
else { fatalError("Cannot create PNG destination") }
CGImageDestinationAddImage(destination, rendered, nil)
guard CGImageDestinationFinalize(destination) else { fatalError("Cannot save PNG") }
print("Exported \(image.width) × \(image.height) app tile; inset 5%, radius 18%.")
