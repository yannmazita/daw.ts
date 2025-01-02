# daw.ts

Work in progress! Very early stage.

`daw.ts` is a Digital Audio Workstation (DAW) application built with TypeScript, [React](https://react.dev/), [Zustand](https://github.com/pmndrs/zustand), and [Tone.js](https://tonejs.github.io/).

![capture](https://github.com/user-attachments/assets/a221666e-7c07-424d-943a-146f85e3a938)

## Getting Started

1.  Clone the repository:

    ```bash
    git clone https://github.com/yannmazita/daw.ts.git
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Start the application (development server)

    ```bash
    npm run dev
    ```

## Architecture

Because sometimes a picture is worth a thousand words.

### Engine Interaction

<details>
    <summary>
    Transport Control Interaction
    </summary>

```mermaid
sequenceDiagram
    participant UI
    participant useTransportControls
    participant TransportEngine

    UI->>useTransportControls: play()
    useTransportControls->>TransportEngine: play()
    TransportEngine->>Tone.js: start()
    TransportEngine-->>useTransportControls: isPlaying = true
    useTransportControls-->>UI: isPlaying = true

    UI->>useTransportControls: pause()
    useTransportControls->>TransportEngine: pause()
    TransportEngine->>Tone.js: pause()
     TransportEngine-->>useTransportControls: isPlaying = false
    useTransportControls-->>UI: isPlaying = false

    UI->>useTransportControls: stop()
    useTransportControls->>TransportEngine: stop()
    TransportEngine->>Tone.js: stop()
    TransportEngine-->>useTransportControls: isPlaying = false, isRecording = false
    useTransportControls-->>UI: isPlaying = false, isRecording = false

    UI->>useTransportControls: setTempo(tempo)
    useTransportControls->>TransportEngine: setTempo(tempo)
    TransportEngine->>Tone.js: setBpm(tempo)
    TransportEngine-->>useTransportControls: tempo
    useTransportControls-->>UI: tempo
```

</details>

<details>
    <summary>
    Mixer Device Interaction
    </summary>

```mermaid
sequenceDiagram
    participant UI
    participant useMixerTrackOperations
    participant MixEngine

    UI->>useMixerTrackOperations: addDevice(trackId, deviceType)
    useMixerTrackOperations->>MixEngine: addDevice(trackId, deviceType)
    MixEngine->>Tone.js: createEffectNode(deviceType)
    MixEngine-->>useMixerTrackOperations: deviceId
    useMixerTrackOperations-->>UI: deviceId

    UI->>useMixerTrackOperations: updateDevice(trackId, deviceId, updates)
    useMixerTrackOperations->>MixEngine: updateDevice(trackId, deviceId, updates)
    MixEngine->>Tone.js: updateNode(updates)
    MixEngine-->>useMixerTrackOperations: updated device
    useMixerTrackOperations-->>UI: updated device
```

</details>

<details>
    <summary>
    Clip Scheduling Interaction
    </summary>

```mermaid
sequenceDiagram
    participant UI
    participant useTrackOperations
    participant ArrangementEngine
    participant ClipEngine

    UI->>useTrackOperations: addClip(contentId, startTime)
    useTrackOperations->>ArrangementEngine: addClip(contentId, startTime)
    ArrangementEngine->>ClipEngine: scheduleClip(clip)
    ClipEngine->>Tone.js: start(time)
    ClipEngine-->>ArrangementEngine: clipId
    ArrangementEngine-->>useTrackOperations: clipId
    useTrackOperations-->>UI: clipId
```

</details>

<details>
    <summary>
    Automation Scheduling Interaction
    </summary>

```mermaid
sequenceDiagram
    participant UI
    participant ArrangementEngine
    participant AutomationEngine

    UI->>AutomationEngine: createLane(targetType, targetId, parameterId)
    UI->>AutomationEngine: addPoint(laneId, time, value)
    UI->>ArrangementEngine: scheduleLane(laneId)
    ArrangementEngine->>AutomationEngine: scheduleLane(laneId)
    AutomationEngine-->>ArrangementEngine: laneId
    ArrangementEngine-->>UI: laneId
    Note over AutomationEngine: Placeholder, no Tone.js interaction
```

</details>

<details>
    <summary>
    Track Creation Interaction
    </summary>

```mermaid
sequenceDiagram
    participant UI
    participant useTrackOperations
    participant ArrangementEngine
    participant MixEngine

    UI->>useTrackOperations: createTrack(type, name)
    useTrackOperations->>ArrangementEngine: createTrack(type, name)
    ArrangementEngine->>Tone.js: createAudioNodes()
    ArrangementEngine->>MixEngine: createSend(trackId, masterId)
    MixEngine-->>ArrangementEngine: sendId
    ArrangementEngine-->>useTrackOperations: trackId
    useTrackOperations-->>UI: trackId
```

</details>

### Audio Signal Flow

<details>
    <summary>
    Mixer Track Signal Flow
    </summary>

```mermaid
graph LR
    A[Gain: Input] --> B(Effects: Pre-Fader);
    B --> C[Channel: Channel Strip];
    C --> D(Effects: Post-Fader);
    D --> E[Meter: Meter];
    E --> F[Output: Output];
```

</details>

<details>
    <summary>
    Send Routing Signal Flow
    </summary>

```mermaid
graph LR
    A[Input: Source Track] --> B{Gain: Pre-Fader Send};
    A --> C[Channel: Source Track];
    C --> D{Gain: Post-Fader Send};
    B --> E[Gain: Send Gain];
    D --> E;
    E --> F[Input: Return Track];
    F --> G[Output: Destination]
```

</details>

<details>
    <summary>
    Track Signal Flow
    </summary>

```mermaid
    graph LR
        A[Gain: Track Input] --> B[Panner: Panner];
        B --> C[Channel: Channel Strip];
        C --> D[Meter: Meter];
        D --> E[Output: Output];
```

</details>

<details>
    <summary>
    Master Track Signal Flow
    </summary>

```mermaid
    graph LR
        A[Gain: Master Track Input] --> B(Effects: Pre-Fader);
        B --> C[Channel: Channel Strip];
        C --> D(Effects: Post-Fader);
        D --> E[Meter: Meter];
        E --> F[Output: Destination];
```

</details>

<details>
    <summary>
    Still maybe a few words on the architecture...
    </summary>

The application logic is made of engines (modules) that allow the application to grow with new features. Each engine has its own logic and state and is initialized by `EngineManager`.
Currently there are 5 engines.

### Arrangement Engine

This engine manages track and clip arrangement in the timeline. It interacts with `MixEngine` and `ClipEngine` to handle sends or playback.

### Automation Engine

_Not implemented yet._ This engine manages automation lanes and paramater connections.

### Clip Engine

This engine manages clips (MIDI clips and audio clips), MIDI file parsing, audio buffers etc.

### Mix Engine

This engine manages mixing, sends, routing etc. Audio processing is done through Tone.js and is extended when needed.

### Transport Engine

This engine manages playback transport, tempo (and tempo tap), time signature, loop settings. Interacts with Tone.js ot control transport state.

</details

## Contributing

Contributions are welcome (and needed)! Features, business logic, UI, tests, optimization, Electron integration etc... there is a lot to do!

Just look at these plain grey rectangles (they are meant to be meters), and empty spaces (they are meant to be features).
