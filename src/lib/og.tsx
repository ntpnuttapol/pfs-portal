import { ImageResponse } from 'next/og'

type OgImageOptions = {
  eyebrow: string
  title: string
  description: string
  accentFrom: string
  accentTo: string
}

export const ogImageSize = {
  width: 1200,
  height: 630,
}

export const ogImageContentType = 'image/png'

export function createOgImage({
  eyebrow,
  title,
  description,
  accentFrom,
  accentTo,
}: OgImageOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          background:
            'linear-gradient(135deg, rgb(248, 250, 252) 0%, rgb(255, 255, 255) 45%, rgb(241, 245, 249) 100%)',
          color: '#0f172a',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at top left, rgba(59,130,246,0.12), transparent 36%), radial-gradient(circle at bottom right, rgba(15,23,42,0.08), transparent 32%)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 360,
            height: 360,
            borderRadius: 9999,
            background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})`,
            opacity: 0.18,
            filter: 'blur(18px)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            bottom: -140,
            left: -60,
            width: 320,
            height: 320,
            borderRadius: 9999,
            background: `linear-gradient(135deg, ${accentTo}, ${accentFrom})`,
            opacity: 0.14,
            filter: 'blur(24px)',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            padding: '54px 60px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#111827',
                  color: 'white',
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                P
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    letterSpacing: -0.04,
                  }}
                >
                  PFS Portal
                </div>
                <div
                  style={{
                    fontSize: 16,
                    color: '#475569',
                  }}
                >
                  Polyfoam Suvarnabhumi
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: 9999,
                background: 'rgba(255,255,255,0.82)',
                border: '1px solid rgba(148,163,184,0.28)',
                padding: '12px 18px',
                fontSize: 18,
                fontWeight: 600,
                color: '#334155',
              }}
            >
              {eyebrow}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              maxWidth: 860,
              gap: 24,
            }}
          >
            <div
              style={{
                fontSize: 68,
                lineHeight: 1.02,
                fontWeight: 800,
                letterSpacing: -2.8,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 28,
                lineHeight: 1.38,
                color: '#475569',
              }}
            >
              {description}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 14,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 9999,
                  background: '#111827',
                  color: 'white',
                  padding: '12px 18px',
                  fontSize: 20,
                  fontWeight: 600,
                }}
              >
                Internal portal directory
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 9999,
                  background: 'rgba(255,255,255,0.72)',
                  border: '1px solid rgba(148,163,184,0.26)',
                  color: '#334155',
                  padding: '12px 18px',
                  fontSize: 20,
                  fontWeight: 600,
                }}
              >
                SSO-ready access
              </div>
            </div>

            <div
              style={{
                fontSize: 18,
                color: '#64748b',
              }}
            >
              hub.polyfoam
            </div>
          </div>
        </div>
      </div>
    ),
    ogImageSize
  )
}
