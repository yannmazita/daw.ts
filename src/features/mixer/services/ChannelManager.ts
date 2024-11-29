// src/features/mixer/services/ChannelManager.ts

import * as Tone from "tone";

interface ChannelNodes {
  channel: Tone.Channel;
  meter: Tone.Meter;
  sends: Map<string, SendNodes>;
}

interface ChannelParameters {
  volume?: number;
  pan?: number;
  mute?: boolean;
  solo?: boolean;
}

interface SendNodes {
  gain: Tone.Gain;
  meter: Tone.Meter;
  preFaderNode: Tone.Gain;
  postFaderNode: Tone.Gain;
  muted: boolean;
  level: number;
  dispose: () => void;
}

interface SendParameters {
  level?: number;
  preFader?: boolean;
  mute?: boolean;
}

export class ChannelManager {
  private channels = new Map<string, ChannelNodes>();
  private masterChannel?: ChannelNodes;
  private soloChannels = new Set<string>();
  private sends = new Map<string, SendNodes>();

  constructor() {
    // Initialize master channel
    this.masterChannel = this.createChannelNodes(true);
  }

  private createChannelNodes(isMaster = false): ChannelNodes {
    const channel = new Tone.Channel();
    const meter = new Tone.Meter();

    if (isMaster) {
      channel.toDestination();
    } else {
      // Ensure master channel exists before connecting
      if (this.masterChannel?.channel) {
        channel.connect(this.masterChannel.channel);
      } else {
        // If no master channel, connect directly to destination
        channel.toDestination();
      }
    }

    channel.connect(meter);

    return {
      channel,
      meter,
      sends: new Map(),
    };
  }

  /**
   * Creates a new channel with the specified ID
   */
  addChannel(id: string): void {
    if (!this.channels.has(id)) {
      this.channels.set(id, this.createChannelNodes());
    }
  }

  /**
   * Removes and disposes of a channel and its associated nodes
   */
  removeChannel(id: string): void {
    const nodes = this.channels.get(id);
    if (nodes) {
      nodes.channel.dispose();
      nodes.meter.dispose();
      nodes.sends.forEach((send) => send.dispose());
      this.channels.delete(id);
      this.soloChannels.delete(id);
      this.updateSoloStates();
    }
  }

  /**
   * Gets the Tone.Channel instance for the specified channel ID
   */
  getChannel(id: string): Tone.Channel | undefined {
    return id === "master"
      ? this.masterChannel?.channel
      : this.channels.get(id)?.channel;
  }

  /**
   * Gets the Tone.Meter instance for the specified channel ID
   */
  getMeter(id: string): Tone.Meter | undefined {
    return id === "master"
      ? this.masterChannel?.meter
      : this.channels.get(id)?.meter;
  }

  /**
   * Updates channel parameters
   */
  updateChannel(id: string, parameters: ChannelParameters): void {
    const channel = this.getChannel(id);
    if (!channel) return;

    if (typeof parameters.volume !== "undefined") {
      channel.volume.value = parameters.volume;
    }
    if (typeof parameters.pan !== "undefined") {
      channel.pan.value = parameters.pan;
    }
    if (typeof parameters.mute !== "undefined") {
      channel.mute = parameters.mute;
    }
    if (typeof parameters.solo !== "undefined") {
      if (parameters.solo) {
        this.soloChannels.add(id);
      } else {
        this.soloChannels.delete(id);
      }
      this.updateSoloStates();
    }
  }

  private createSendNodes(): SendNodes {
    const gain = new Tone.Gain(0);
    const meter = new Tone.Meter();
    const preFaderNode = new Tone.Gain(1);
    const postFaderNode = new Tone.Gain(1);

    return {
      gain,
      meter,
      preFaderNode,
      postFaderNode,
      muted: false,
      level: 0,
      dispose: () => {
        gain.dispose();
        meter.dispose();
        preFaderNode.dispose();
        postFaderNode.dispose();
      },
    };
  }

  /**
   * Creates a send from one channel to another
   */
  createSend(fromId: string, toId: string, preFader: boolean): string {
    const sendId = `send_${fromId}_${toId}`;
    const sourceChannel = this.getChannel(fromId);
    const targetChannel = this.getChannel(toId);

    if (sourceChannel && targetChannel) {
      const sendNodes = this.createSendNodes();

      // Connect pre-fader tap
      // Use the channel's internal nodes for proper routing
      sourceChannel.connect(sendNodes.preFaderNode);
      sendNodes.preFaderNode.connect(sendNodes.gain);

      // Connect post-fader tap - this will automatically be post-fader
      sourceChannel.connect(sendNodes.postFaderNode);
      sendNodes.postFaderNode.connect(sendNodes.gain);

      // Connect to meter and destination
      sendNodes.gain.connect(sendNodes.meter);
      sendNodes.gain.connect(targetChannel);

      // Store send nodes
      this.sends.set(sendId, sendNodes);

      // Set initial routing
      this.updateSend(sendId, { preFader });
    }

    return sendId;
  }

  /**
   * Updates the level of an existing send
   */
  updateSend(sendId: string, parameters: SendParameters): void {
    const sendNodes = this.sends.get(sendId);
    if (!sendNodes) return;

    if (typeof parameters.level !== "undefined") {
      sendNodes.gain.gain.value = parameters.level;
    }

    if (typeof parameters.preFader !== "undefined") {
      sendNodes.preFaderNode.gain.value = parameters.preFader ? 1 : 0;
      sendNodes.postFaderNode.gain.value = parameters.preFader ? 0 : 1;
    }

    if (typeof parameters.mute !== "undefined") {
      sendNodes.muted = parameters.mute;
      sendNodes.gain.gain.value = parameters.mute ? 0 : sendNodes.level;
    }
  }

  /**
   * Removes and disposes of a send
   */
  removeSend(sendId: string): void {
    const sendNodes = this.sends.get(sendId);
    if (sendNodes) {
      sendNodes.gain.dispose();
      sendNodes.meter.dispose();
      sendNodes.preFaderNode.dispose();
      sendNodes.postFaderNode.dispose();
      this.sends.delete(sendId);
    }
  }

  /**
   * Gets the current send parameters
   */
  getSendParameters(sendId: string): SendParameters | undefined {
    const sendNodes = this.sends.get(sendId);
    if (!sendNodes) return undefined;

    return {
      level: sendNodes.level,
      preFader: sendNodes.preFaderNode.gain.value > 0,
      mute: sendNodes.muted,
    };
  }

  getSendMeter(sendId: string): Tone.Meter | undefined {
    return this.sends.get(sendId)?.meter;
  }

  /**
   * Gets a channel's send gain nodes
   */
  getSends(channelId: string): Map<string, SendNodes> {
    const emptyMap = new Map<string, SendNodes>();

    if (channelId === "master") {
      return this.masterChannel?.sends ?? emptyMap;
    }

    return this.channels.get(channelId)?.sends ?? emptyMap;
  }

  /**
   * Disconnects a channel's output (for rebuilding effect chains)
   */
  disconnectChannel(id: string): void {
    const channel = this.getChannel(id);
    if (channel) {
      channel.disconnect();
    }
  }

  /**
   * Connects a channel to its destination (master or main output)
   */
  connectChannel(id: string): void {
    const channel = this.getChannel(id);
    if (!channel) return;

    if (id === "master") {
      channel.toDestination();
    } else if (this.masterChannel?.channel) {
      channel.connect(this.masterChannel.channel);
    } else {
      // Fallback to connecting directly to destination if master channel is not available
      channel.toDestination();
    }
  }

  /**
   * Updates channel muting based on solo states
   */
  private updateSoloStates(): void {
    const hasSolo = this.soloChannels.size > 0;

    this.channels.forEach((nodes, id) => {
      nodes.channel.mute = hasSolo && !this.soloChannels.has(id);
    });
  }

  /**
   * Gets all channel IDs
   */
  get channelIds(): string[] {
    return Array.from(this.channels.keys());
  }

  /**
   * Gets the number of channels (excluding master)
   */
  get count(): number {
    return this.channels.size;
  }

  /**
   * Disposes of all channels and their associated nodes
   */
  dispose(): void {
    this.masterChannel?.channel.dispose();
    this.masterChannel?.meter.dispose();
    this.masterChannel?.sends.forEach((send) => send.dispose());

    this.channels.forEach((nodes) => {
      nodes.channel.dispose();
      nodes.meter.dispose();
      nodes.sends.forEach((send) => send.dispose());
    });

    this.channels.clear();
    this.soloChannels.clear();

    this.sends.forEach((nodes) => {
      nodes.gain.dispose();
      nodes.meter.dispose();
      nodes.preFaderNode.dispose();
      nodes.postFaderNode.dispose();
    });
    this.sends.clear();
  }
}
