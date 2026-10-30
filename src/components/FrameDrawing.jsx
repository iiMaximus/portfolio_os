import data from "../models/drone/frameProfiles.json";
import {
  armPlacements,
  armPoint,
  motorPositions,
  boardPositions,
} from "../models/drone/assemblyConfig";

const line = (points) => `M${points.map((p) => p.join(",")).join("L")}Z`;
function Profile({
  profile,
  transform = (p) => p,
  fill = "none",
  opacity = 1,
}) {
  return (
    <g opacity={opacity}>
      <path
        d={[
          line(profile.outer.map(transform)),
          ...profile.cutouts.map((loop) => line(loop.map(transform))),
        ].join(" ")}
        fill={fill}
        fillRule="evenodd"
      />
      {profile.holes.map((hole, i) => {
        const [x, y] = transform(hole.center);
        return <circle key={i} cx={x} cy={y} r={hole.radius} />;
      })}
    </g>
  );
}
export default function FrameDrawing() {
  return (
    <svg
      className="drone-drawing"
      viewBox="-185 -135 370 320"
      fill="none"
      role="img"
      aria-label="Top view reconstructed from the five original DXF cut profiles, showing separate FC and ESC mounting positions"
    >
      <defs>
        <pattern
          id="drawing-grid"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <path d="M10 0H0v10" stroke="currentColor" strokeWidth=".16" />
        </pattern>
      </defs>
      <rect
        x="-185"
        y="-135"
        width="370"
        height="320"
        fill="url(#drawing-grid)"
        opacity=".25"
      />
      <g
        transform="scale(1,-1)"
        stroke="currentColor"
        strokeWidth=".65"
        strokeLinejoin="round"
      >
        {motorPositions.map(([x, y], i) => (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r="63.5"
              strokeDasharray="2 3"
              opacity=".35"
            />
            <path d={`M${x - 19} ${y}h38 M${x} ${y - 19}v38`} opacity=".35" />
          </g>
        ))}
        {armPlacements.map((arm) => (
          <Profile
            key={arm.id}
            profile={data.profiles[arm.profile]}
            transform={(p) => armPoint(p, arm)}
          />
        ))}
        <Profile profile={data.profiles.bottom} opacity={0.45} />
        <Profile profile={data.profiles.xplate} />
        <Profile profile={data.profiles.top} opacity={0.38} />
        {boardPositions.map((board) => (
          <rect
            key={board.id}
            x={-15.25}
            y={board.center[1] - 15.25}
            width="30.5"
            height="30.5"
            strokeDasharray="2 2"
            opacity=".7"
          />
        ))}
      </g>
      <g fill="currentColor" fontFamily="monospace" fontSize="5.5">
        <text x="-8" y="-18">
          FC
        </text>
        <text x="-8" y="27">
          ESC
        </text>
        <text x="-170" y="-120">
          SOURCE / 5 DXF CUT PROFILES
        </text>
        <text x="-170" y="173">
          2 / 6 mm STOCK (PROVISIONAL)
        </text>
        <text x="70" y="173">
          5-INCH PROP ENVELOPE
        </text>
      </g>
    </svg>
  );
}
