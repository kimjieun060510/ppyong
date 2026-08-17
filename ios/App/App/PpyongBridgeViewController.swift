import Capacitor
import UIKit

@objc(PpyongBridgeViewController)
class PpyongBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(PpyongAppleAuth())
    }

    override open var supportedInterfaceOrientations: UIInterfaceOrientationMask {
        .allButUpsideDown
    }
}
