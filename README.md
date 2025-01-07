# daw.ts

Work in progress! Very early stage.

`daw.ts` is a Digital Audio Workstation (DAW) application built with TypeScript, [React](https://react.dev/), [Zustand](https://github.com/pmndrs/zustand), and [Tone.js](https://tonejs.github.io/).

![capture](https://github.com/user-attachments/assets/a5ebd776-026c-439a-862f-5dd7158097c8)

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
    State Update Flow
    </summary>

```mermaid
sequenceDiagram
    participant C as Component
    participant H as Hook
    participant S as Store
    participant E as Engine
    participant A as AudioNode

    C->>H: Call hook method
    H->>E: Call engine method
    E->>A: Update audio node
    E->>S: Update state
    S->>C: Re-render with new state
```

</details>

<details>
    <summary>
    Audio State Management
    </summary>

```mermaid
sequenceDiagram
    participant C as Component
    participant S as Store
    participant E as Engine
    participant T as Tone.js
    participant A as AudioContext

    C->>S: Update State
    S->>E: Notify Engine
    E->>T: Update Audio Nodes
    T->>A: Schedule Changes
    A->>T: Audio Processing
    T->>E: Update Status
    E->>S: Update State
    S->>C: Re-render
```

</details>

<details>
    <summary>
    State Update Lifecycle
    </summary>

The intended lifecycle, more often than not validation and rollback are not (yet) implemented.

```mermaid
stateDiagram-v2
    [*] --> InitialState
    InitialState --> UpdateRequested: Action Triggered
    UpdateRequested --> ValidationCheck: Check Update
    ValidationCheck --> AudioNodeUpdate: Valid
    ValidationCheck --> ErrorState: Invalid
    AudioNodeUpdate --> StateUpdate: Success
    AudioNodeUpdate --> ErrorState: Failure
    StateUpdate --> [*]
    ErrorState --> InitialState: Rollback
```

</details>

<details>
    <summary>
    Transport Time Flow
    </summary>

```mermaid
sequenceDiagram
    participant T as Transport
    participant S as Scheduler
    participant C as Clock
    participant A as AudioContext

    T->>S: Schedule Event
    S->>C: Calculate Time
    C->>A: Schedule Audio
    A->>C: Time Update
    C->>T: Position Update
    T->>S: Check Schedule
```

</details>

<details>
    <summary>
    Mix Engine Architecture
    </summary>

```mermaid
graph TD
    A[MixEngine] --> B[Master Track]
    A --> C[Return Tracks]
    A --> D[Sound Chains]

    B --> E[Master Channel]
    E --> F[Destination]

    C --> G[Return Channels]
    G --> E

    D --> H[Device Chain]
    H --> I[Track Input]
    I --> J[Track Channel]
    J --> E
```

</details>

### Audio Signal Flow

<details>
    <summary>
    Mixer Track Types
    </summary>

```mermaid
graph TD
    A[Mixer Tracks] --> B[Regular Track]
    A --> C[Return Track]
    A --> D[Master Track]

    B --> E[Channel Strip]
    C --> E
    D --> E

    E --> F[Input Gain]
    E --> G[Pan]
    E --> H[Volume]
    E --> I[Meter]
```

</details>

<details>
    <summary>
    Send/Return Architecture
    </summary>

```mermaid
graph TD
    A[Source Track] --> B{Send Point}
    B -->|Pre-Fader| C[Send Gain]
    B -->|Post-Fader| C
    C --> D[Return Track]
    D --> E[Master Track]

    F[Source Track 2] --> G{Send Point}
    G -->|Pre-Fader| H[Send Gain]
    G -->|Post-Fader| H
    H --> D
```

</details>

<details>
    <summary>
    Device Routing
    </summary>

```mermaid
sequenceDiagram
    participant I as Input
    participant D as Device Chain
    participant B as Bypass
    participant O as Output

    I->>D: Audio Signal
    D->>B: Process
    B-->>O: Bypassed
    B->>O: Processed
```

</details>

<details>
    <summary>
    Still maybe a few words on the architecture...
    </summary>

The application logic is made of engines (modules) that allow the application to grow with new features. Each engine has its own logic and state and is initialized by `EngineManager`.
Currently there are 6 engines.

### Composition Engine

This engine is the orchestrator for all other engines, it is the sole interface for the UI and has dedicated services for each engine.

### Track Engine

This engine manages track creation and manipulation (volume, pan, routing, metering etc).

### Automation Engine

_Not fully implemented yet._ This engine manages automation lanes and paramater connections.

### Clip Engine

This engine manages clips (MIDI clips and audio clips), MIDI file parsing, audio buffers etc.

### Mix Engine

This engine manages mixing, sends, routing, sound chains etc. Audio processing is done through Tone.js and is extended when needed.

### Transport Engine

This engine manages playback transport, tempo (and tempo tap), time signature, loop settings. Interacts with Tone.js ot control transport state.

</details>

## Contributing

Contributions are welcome (and needed)! Features, business logic, UI, tests, optimization, Electron integration etc... there is a lot to do!
