import AppKit
import Foundation

guard CommandLine.arguments.count == 3 else { fatalError("Usage: swift read-system-icon.swift APP OUTPUT.png") }
let icon = NSWorkspace.shared.icon(forFile: CommandLine.arguments[1])
guard let tiff = icon.tiffRepresentation,
      let bitmap = NSBitmapImageRep(data: tiff),
      let png = bitmap.representation(using: .png, properties: [:]) else {
    fatalError("System icon could not be rendered")
}
try png.write(to: URL(fileURLWithPath: CommandLine.arguments[2]))
print("System-resolved icon: \(bitmap.pixelsWide) × \(bitmap.pixelsHigh)")
