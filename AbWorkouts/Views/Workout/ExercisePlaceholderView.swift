import SwiftUI

/// Temporary form demo until licensed GIFs/MP4s are added.
struct ExercisePlaceholderView: View {
    let kind: Exercise.PlaceholderKind
    let tint: Color

    @State private var phase = false

    var body: some View {
        TimelineView(.animation(minimumInterval: 1 / 30, paused: false)) { context in
            let t = context.date.timeIntervalSinceReferenceDate
            Canvas { context, size in
                let center = CGPoint(x: size.width * 0.5, y: size.height * 0.55)
                drawFigure(in: context, size: size, center: center, time: t)
            }
        }
        .padding(24)
        .background(
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(AppTheme.surface)
                .overlay(
                    RoundedRectangle(cornerRadius: 28, style: .continuous)
                        .strokeBorder(tint.opacity(0.35), lineWidth: 1)
                )
        )
        .onAppear { phase = true }
    }

    private func drawFigure(
        in context: GraphicsContext,
        size: CGSize,
        center: CGPoint,
        time: TimeInterval
    ) {
        let pulse = 0.5 + 0.5 * sin(time * 2.2)
        var figure = context
        figure.opacity = 0.95

        let stroke = tint
        let secondary = tint.opacity(0.55)

        switch kind {
        case .crunch, .sitUp, .toeTouch, .reverseCrunch, .heelTap:
            drawSupineCurl(context: &figure, center: center, size: size, amount: 0.25 + 0.35 * pulse, color: stroke)
        case .legRaise, .flutter, .scissor:
            drawLegRaise(context: &figure, center: center, size: size, time: time, color: stroke)
        case .deadBug:
            drawDeadBug(context: &figure, center: center, size: size, time: time, color: stroke)
        case .bicycle, .russianTwist:
            drawTwist(context: &figure, center: center, size: size, time: time, color: stroke)
        case .sidePlank:
            drawSidePlank(context: &figure, center: center, size: size, color: stroke)
        case .plank, .mountainClimber:
            drawPlank(context: &figure, center: center, size: size, time: time, climbing: kind == .mountainClimber, color: stroke)
        case .hollowHold:
            drawHollow(context: &figure, center: center, size: size, color: stroke, accent: secondary)
        }

        // Soft ground line
        var ground = Path()
        let y = size.height * 0.82
        ground.move(to: CGPoint(x: size.width * 0.18, y: y))
        ground.addLine(to: CGPoint(x: size.width * 0.82, y: y))
        context.stroke(ground, with: .color(secondary.opacity(0.45)), style: StrokeStyle(lineWidth: 2, lineCap: .round))
    }

    private func drawSupineCurl(
        context: inout GraphicsContext,
        center: CGPoint,
        size: CGSize,
        amount: Double,
        color: Color
    ) {
        let scale = min(size.width, size.height)
        var path = Path()
        let hip = CGPoint(x: center.x - scale * 0.02, y: center.y + scale * 0.06)
        let shoulder = CGPoint(
            x: hip.x - scale * 0.16,
            y: hip.y - scale * (0.02 + 0.14 * amount)
        )
        let knee = CGPoint(x: hip.x + scale * 0.16, y: hip.y - scale * 0.02)
        let ankle = CGPoint(x: knee.x + scale * 0.14, y: hip.y + scale * 0.08)
        let head = CGPoint(x: shoulder.x - scale * 0.08, y: shoulder.y - scale * 0.08)

        path.move(to: ankle)
        path.addLine(to: knee)
        path.addLine(to: hip)
        path.addLine(to: shoulder)
        context.stroke(path, with: .color(color), style: StickStyle.stroke)
        context.fill(Circle().path(in: CGRect(x: head.x - 10, y: head.y - 10, width: 20, height: 20)), with: .color(color))
    }

    private func drawLegRaise(
        context: inout GraphicsContext,
        center: CGPoint,
        size: CGSize,
        time: TimeInterval,
        color: Color
    ) {
        let scale = min(size.width, size.height)
        let lift = 0.35 + 0.25 * sin(time * 2.4)
        let hip = CGPoint(x: center.x - scale * 0.12, y: center.y + scale * 0.08)
        let head = CGPoint(x: hip.x - scale * 0.18, y: hip.y - scale * 0.04)
        let toe = CGPoint(x: hip.x + scale * 0.28, y: hip.y - scale * lift)

        var torso = Path()
        torso.move(to: head)
        torso.addLine(to: hip)
        context.stroke(torso, with: .color(color), style: StickStyle.stroke)

        var legs = Path()
        legs.move(to: hip)
        legs.addLine(to: toe)
        context.stroke(legs, with: .color(color), style: StickStyle.stroke)
        context.fill(Circle().path(in: CGRect(x: head.x - 10, y: head.y - 14, width: 20, height: 20)), with: .color(color))
    }

    private func drawDeadBug(
        context: inout GraphicsContext,
        center: CGPoint,
        size: CGSize,
        time: TimeInterval,
        color: Color
    ) {
        let scale = min(size.width, size.height)
        let swing = sin(time * 2.0)
        let hip = center
        let shoulder = CGPoint(x: hip.x - scale * 0.12, y: hip.y - scale * 0.02)
        let arm = CGPoint(x: shoulder.x - scale * 0.08, y: shoulder.y - scale * (0.18 + 0.06 * swing))
        let leg = CGPoint(x: hip.x + scale * 0.18, y: hip.y + scale * (0.04 - 0.12 * swing))

        var path = Path()
        path.move(to: arm)
        path.addLine(to: shoulder)
        path.addLine(to: hip)
        path.addLine(to: leg)
        context.stroke(path, with: .color(color), style: StickStyle.stroke)
        context.fill(Circle().path(in: CGRect(x: shoulder.x - 18, y: shoulder.y - 18, width: 18, height: 18)), with: .color(color))
    }

    private func drawTwist(
        context: inout GraphicsContext,
        center: CGPoint,
        size: CGSize,
        time: TimeInterval,
        color: Color
    ) {
        let scale = min(size.width, size.height)
        let twist = sin(time * 2.5)
        let seat = CGPoint(x: center.x, y: center.y + scale * 0.08)
        let chest = CGPoint(x: seat.x + scale * 0.10 * twist, y: seat.y - scale * 0.18)
        let hand = CGPoint(x: chest.x + scale * 0.16 * twist, y: chest.y + scale * 0.02)

        var path = Path()
        path.move(to: CGPoint(x: seat.x - scale * 0.12, y: seat.y + scale * 0.08))
        path.addLine(to: seat)
        path.addLine(to: chest)
        path.addLine(to: hand)
        context.stroke(path, with: .color(color), style: StickStyle.stroke)
        context.fill(Circle().path(in: CGRect(x: chest.x - 8, y: chest.y - 22, width: 18, height: 18)), with: .color(color))
    }

    private func drawSidePlank(
        context: inout GraphicsContext,
        center: CGPoint,
        size: CGSize,
        color: Color
    ) {
        let scale = min(size.width, size.height)
        let elbow = CGPoint(x: center.x - scale * 0.18, y: center.y + scale * 0.12)
        let shoulder = CGPoint(x: elbow.x, y: elbow.y - scale * 0.14)
        let hip = CGPoint(x: shoulder.x + scale * 0.22, y: shoulder.y)
        let feet = CGPoint(x: hip.x + scale * 0.22, y: hip.y + scale * 0.02)

        var path = Path()
        path.move(to: elbow)
        path.addLine(to: shoulder)
        path.addLine(to: hip)
        path.addLine(to: feet)
        context.stroke(path, with: .color(color), style: StickStyle.stroke)
        context.fill(Circle().path(in: CGRect(x: shoulder.x - 8, y: shoulder.y - 22, width: 18, height: 18)), with: .color(color))
    }

    private func drawPlank(
        context: inout GraphicsContext,
        center: CGPoint,
        size: CGSize,
        time: TimeInterval,
        climbing: Bool,
        color: Color
    ) {
        let scale = min(size.width, size.height)
        let shoulder = CGPoint(x: center.x - scale * 0.16, y: center.y - scale * 0.02)
        let hip = CGPoint(x: center.x + scale * 0.08, y: center.y - scale * 0.01)
        let feet = CGPoint(x: hip.x + scale * 0.20, y: hip.y + scale * 0.08)
        let hands = CGPoint(x: shoulder.x - scale * 0.02, y: shoulder.y + scale * 0.14)

        var path = Path()
        path.move(to: hands)
        path.addLine(to: shoulder)
        path.addLine(to: hip)
        path.addLine(to: feet)
        context.stroke(path, with: .color(color), style: StickStyle.stroke)

        if climbing {
            let kneeLift = 0.5 + 0.5 * sin(time * 5)
            let knee = CGPoint(x: hip.x - scale * 0.06, y: hip.y + scale * (0.02 - 0.12 * kneeLift))
            var climber = Path()
            climber.move(to: hip)
            climber.addLine(to: knee)
            context.stroke(climber, with: .color(color), style: StickStyle.stroke)
        }

        context.fill(Circle().path(in: CGRect(x: shoulder.x - 10, y: shoulder.y - 22, width: 18, height: 18)), with: .color(color))
    }

    private func drawHollow(
        context: inout GraphicsContext,
        center: CGPoint,
        size: CGSize,
        color: Color,
        accent: Color
    ) {
        let scale = min(size.width, size.height)
        let hip = center
        let hands = CGPoint(x: hip.x - scale * 0.28, y: hip.y - scale * 0.06)
        let feet = CGPoint(x: hip.x + scale * 0.28, y: hip.y - scale * 0.04)

        var path = Path()
        path.move(to: hands)
        path.addQuadCurve(to: feet, control: CGPoint(x: hip.x, y: hip.y + scale * 0.12))
        context.stroke(path, with: .color(color), style: StickStyle.stroke)
        context.stroke(
            Path { p in
                p.move(to: CGPoint(x: hip.x - scale * 0.08, y: hip.y + scale * 0.02))
                p.addLine(to: CGPoint(x: hip.x + scale * 0.08, y: hip.y + scale * 0.02))
            },
            with: .color(accent),
            style: StrokeStyle(lineWidth: 3, lineCap: .round)
        )
        context.fill(Circle().path(in: CGRect(x: hands.x + 8, y: hands.y - 18, width: 18, height: 18)), with: .color(color))
    }
}

private enum StickStyle {
    static let stroke = StrokeStyle(lineWidth: 5, lineCap: .round, lineJoin: .round)
}
