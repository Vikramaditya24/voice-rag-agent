import { useTrackTranscription, useTracks } from "@livekit/components-react"
import { Track } from "livekit-client"

export default function TranscriptPanel() {
  const tracks = useTracks([Track.Source.Microphone])
  const { segments } = useTrackTranscription(tracks[0])

  return (
    <div style={{ maxHeight: 200, overflowY: 'auto', fontFamily: 'monospace', fontSize: 13 }}>
      {segments.map(s => (
        <div key={s.id}>
          <b>{s.final ? '✓' : '…'}</b> {s.text}
        </div>
      ))}
    </div>
  )
}