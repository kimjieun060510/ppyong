import AuthenticationServices
import Capacitor
import UIKit

@objc(PpyongAppleAuth)
public class PpyongAppleAuth: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "PpyongAppleAuth"
    public let jsName = "PpyongAppleAuth"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "authorize", returnType: CAPPluginReturnPromise)
    ]

    private var pendingCall: CAPPluginCall?
    private var authController: ASAuthorizationController?

    @objc func authorize(_ call: CAPPluginCall) {
        pendingCall = call

        let request = ASAuthorizationAppleIDProvider().createRequest()
        request.requestedScopes = [.fullName, .email]

        let controller = ASAuthorizationController(authorizationRequests: [request])
        controller.delegate = self
        controller.presentationContextProvider = self
        authController = controller
        controller.performRequests()
    }

    private func finish() {
        pendingCall = nil
        authController = nil
    }
}

extension PpyongAppleAuth: ASAuthorizationControllerDelegate {
    public func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithAuthorization authorization: ASAuthorization
    ) {
        defer { finish() }
        guard let call = pendingCall else { return }
        guard let cred = authorization.credential as? ASAuthorizationAppleIDCredential else {
            call.reject("Apple 로그인 응답이 올바르지 않아요.")
            return
        }

        let token = cred.identityToken.flatMap { String(data: $0, encoding: .utf8) } ?? ""
        let code = cred.authorizationCode.flatMap { String(data: $0, encoding: .utf8) } ?? ""
        call.resolve([
            "response": [
                "user": cred.user,
                "email": cred.email ?? "",
                "givenName": cred.fullName?.givenName ?? "",
                "familyName": cred.fullName?.familyName ?? "",
                "identityToken": token,
                "authorizationCode": code
            ]
        ])
    }

    public func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithError error: Error
    ) {
        defer { finish() }
        guard let call = pendingCall else { return }
        let nsError = error as NSError
        if nsError.domain == ASAuthorizationError.errorDomain,
           nsError.code == ASAuthorizationError.canceled.rawValue {
            call.reject("canceled", "1001", error)
            return
        }
        call.reject(error.localizedDescription, String(nsError.code), error)
    }
}

extension PpyongAppleAuth: ASAuthorizationControllerPresentationContextProviding {
    public func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        if let window = bridge?.webView?.window {
            return window
        }
        return UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap(\.windows)
            .first(where: \.isKeyWindow) ?? UIWindow()
    }
}
