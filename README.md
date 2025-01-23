# daw.ts

Work in progress! Very early stage.

`daw.ts` is a Digital Audio Workstation (DAW) application built with TypeScript, [React](https://react.dev/), [Zustand](https://github.com/pmndrs/zustand), and leveraging the [Web Audio browser API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).

It aims to be performant and extensible for audio production in the browser.

![Screenshot of daw.ts showing the main view](https://github.com/user-attachments/assets/9ef3c5b1-001e-40e0-a901-cd18a7838254)

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

### Audio Signal Flow

<details>
    <summary>
    Conceptual Audio Graph Diagram
    </summary>

```mermaid
graph LR
    subgraph Master Track
        MT_Input(Master Input) --> MT_Pan(Pan)
        MT_Pan --> MT_Gain(Gain)
        MT_Gain --> MT_Output(Destination)
    end

    subgraph Track
        Track_Input(Track Input) --> SoundChainOutput{Sound Chain Output?}
        SoundChainOutput -- Yes --> SC_Output(Sound Chain Output Node)
        SoundChainOutput -- No --> Track_Pan
        SC_Output --> Track_Pan(Pan)
        Track_Pan --> Track_Output(Track Output)
    end

    subgraph Sound Chain
        SC_Input(Sound Chain Input) --> Chain1{Chain 1?}
        Chain1 -- Yes --> Chain1_Output(Chain 1 Output)
        Chain1 -- No --> SC_Output
        Chain1_Output --> Chain2{Chain 2?}
         Chain2 -- Yes --> Chain2_Output(Chain 2 Output)
        Chain2 -- No --> SC_Output
        Chain2_Output --> ...
        ... --> SC_Output(Sound Chain Output Node)
    end

    subgraph Chain
        Chain_Instrument{Instrument?} -- Yes --> Chain_Pan
        Chain_Instrument -- No --> Chain_Effects{Effects?}
        Chain_InstrumentNode(Instrument Node) --> Chain_Pan(Pan)
        Chain_Effects -- Yes --> Chain_EffectsNodes(Effects Nodes)
        Chain_Effects -- No --> Chain_Pan
        Chain_EffectsNodes --> Chain_Pan
        Chain_Pan --> Chain_Output(Chain Output)
    end

    subgraph Return Track
        RT_Input(Return Input) --> RT_Pan(Pan)
        RT_Pan --> RT_Output(Return Output)
    end

    subgraph Send
        Send_Output(Send Output)
    end

    Track_Output --> MT_Input
    RT_Output --> MT_Input
    Send_Output --> RT_Input

    style Master_Track fill:#f9f,stroke:#333,stroke-width:2px
    style Track fill:#ccf,stroke:#333,stroke-width:2px
    style Sound_Chain fill:#cff,stroke:#333,stroke-width:2px
    style Chain fill:#cfc,stroke:#333,stroke-width:2px
    style Return_Track fill:#ffc,stroke:#333,stroke-width:2px
    style Send fill:#fcc,stroke:#333,stroke-width:2px
```

</details>

<details>
    <summary>
    Transport Clock Tick Scheduling
    </summary>

```mermaid
sequenceDiagram
    participant TransportClock
    participant AudioContext
    participant AudioBufferSourceNode

    TransportClock->>TransportClock: start(position)
    activate TransportClock
    TransportClock->TransportClock: isRunning = true
    TransportClock->TransportClock: _position = position
    TransportClock->TransportClock: startTime = AudioContext.currentTime - _position
    TransportClock->TransportClock: scheduleTick()

    TransportClock->>TransportClock: scheduleTick()
    activate TransportClock
    TransportClock->TransportClock: stop existing clockSource (if any)
    TransportClock->AudioBufferSourceNode: createBufferSource()
    AudioBufferSourceNode-->>TransportClock: clockSource
    TransportClock->AudioBufferSourceNode: setBuffer (1 sample buffer)
    TransportClock->AudioBufferSourceNode: connect (AudioContext.destination)
    TransportClock->TransportClock: secondsPerBeat = 60 / _tempo
    TransportClock->TransportClock: nextTickTime = AudioContext.currentTime + secondsPerBeat
    TransportClock->AudioBufferSourceNode: start(nextTickTime, 0, secondsPerBeat)
    TransportClock->AudioBufferSourceNode: onended = tick()
    deactivate TransportClock

    AudioBufferSourceNode-->>TransportClock: onended (playback finished)
    TransportClock->>TransportClock: tick()
    activate TransportClock
    TransportClock->TransportClock: tickCallback()  (e.g., update position)
    TransportClock->TransportClock: scheduleTick()
    deactivate TransportClock
    loop Schedule Tick and Tick execution
        AudioBufferSourceNode-->>TransportClock: onended (playback finished)
        TransportClock->>TransportClock: tick()
        activate TransportClock
        TransportClock->TransportClock: tickCallback()
        TransportClock->TransportClock: scheduleTick()
        deactivate TransportClock
    end

    TransportClock->>TransportClock: stop()
    activate TransportClock
    TransportClock->TransportClock: isRunning = false
    TransportClock->AudioBufferSourceNode: stop()
    TransportClock->AudioBufferSourceNode: disconnect()
    TransportClock->TransportClock: clockSource = null
    TransportClock->TransportClock: nextTickTime = null
    deactivate TransportClock
    deactivate TransportClock
```

</details>

<details>
    <summary>
    Transport Engine Playback Start
    </summary>

```mermaid
sequenceDiagram
    participant TransportEngineImpl
    participant TransportClock
    participant AudioContext
    participant useEngineStore (Zustand)

    TransportEngineImpl->>TransportEngineImpl: play(state, time?)
    activate TransportEngineImpl
    TransportEngineImpl->TransportEngineImpl: checkDisposed()
    TransportEngineImpl->AudioContext: getAudioContext().state
    AudioContext-->>TransportEngineImpl: "suspended"
    alt AudioContext State is "suspended"
        TransportEngineImpl->AudioContext: getAudioContext().resume()
        AudioContext-->>TransportEngineImpl: Promise (resolves when resumed)
        TransportEngineImpl->TransportClock: start(time or currentPosition)
    else AudioContext State is "running" or "initialized"
        TransportEngineImpl->TransportClock: start(time or currentPosition)
    end
    TransportEngineImpl->useEngineStore (Zustand): setState({ isPlaying: true })
    useEngineStore (Zustand)-->>TransportEngineImpl: Updated State
    TransportEngineImpl-->>TransportEngineImpl: Promise (resolves with updated state)
    deactivate TransportEngineImpl
```

</details>

### Engine Interaction

<details>
    <summary>
    Example of state update sequence (VolumeControl Component)
    </summary>

```mermaid
sequenceDiagram
    participant VolumeControl Component
    participant useTrack Hook
    participant MixParameterService
    participant MixEngineImpl
    participant useEngineStore (Zustand)

    VolumeControl Component->>useTrack Hook: setVolume(newValue)  (from Knob onChange or Input change)
    activate useTrack Hook
    useTrack Hook->>MixParameterService: setTrackVolume(trackId, newValue)
    activate MixParameterService
    MixParameterService->MixEngineImpl: parameterService.setTrackVolume(state, trackId, newValue)
    activate MixEngineImpl
    MixEngineImpl->useEngineStore (Zustand): getState()  (get current MixState)
    useEngineStore (Zustand)-->>MixEngineImpl: current MixState
    MixEngineImpl->MixParameterService: setTrackVolume(...) (logic to update volume in MixState)
    MixEngineImpl->useEngineStore (Zustand): setState(updatedMixState)
    useEngineStore (Zustand)-->>MixEngineImpl: Updated State
    MixEngineImpl-->>MixParameterService: updated MixState
    deactivate MixEngineImpl
    MixParameterService-->>useTrack Hook: updated MixState
    deactivate MixParameterService
    useTrack Hook-->>VolumeControl Component: (re-render with updated volume from Zustand)
    deactivate useTrack Hook
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
    ErrorState --> InitialState: Attempt Rollback
```

</details>

<details>
    <summary>
    Still maybe a few words on the architecture...
    </summary>

The application logic is made of engines with dedicated services that allow the application to grow with new features. The engines read a state object then return an updated state object, the service layer finally commits the changes meaning only one update is necessary. This is done immutably, the only side effects are runtime related.

Currently there are 7 engines.

### Composition Engine

This engine is the orchestrator for all other engines, it is the sole interface for the UI and has dedicated services for each engine.

### Track Engine

This engine manages track creation and manipulation (volume, pan, routing, metering etc).

### Automation Engine

_Not fully implemented yet._ This engine manages automation lanes and paramater connections.

### Clip Engine

_Not fully implemented yet._ This engine manages clips (MIDI clips and audio clips).

### Mix Engine

This engine manages mixing, sends, routing, sound chains etc. Audio processing is done through Tone.js and is extended when needed.

### Sampler Engine

_Not fully implemented yet._ This engine manages SFZ instrument loading/caching, sampling playback

### Transport Engine

This engine manages playback transport, tempo (and tempo tap), time signature, loop settings. Interacts with Tone.js ot control transport state.

</details>

## Contributing

Contributions are welcome (and needed), there is a lot to do!
