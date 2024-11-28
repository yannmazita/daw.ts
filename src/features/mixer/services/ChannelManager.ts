// src/features/mixer/services/ChannelManager.ts

import * as Tone from "tone";

interface ChannelNodes {
  channel: Tone.Channel;
  meter: Tone.Meter;
  sends: Map<string, Tone.Gain>;
}

interface ChannelParameters {
  volume?: number;
  pan?: number;
  mute?: boolean;
  solo?: boolean;
}

export class ChannelManager {
  private channels = new Map<string, ChannelNodes>();
  private masterChannel?: ChannelNodes;
  private soloChannels = new Set<string>();

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

  /**
   * Creates a send from one channel to another
   */
  createSend(fromId: string, toId: string, level: number): string {
    const sendId = `send_${fromId}_${toId}`;
    const sourceNodes =
      fromId === "master" ? this.masterChannel : this.channels.get(fromId);
    const destChannel = this.getChannel(toId);

    if (sourceNodes && destChannel) {
      // Remove existing send if it exists
      this.removeSend(fromId, toId);

      // Create new send
      const sendGain = new Tone.Gain(level);
      sourceNodes.channel.connect(sendGain);
      sendGain.connect(destChannel);
      sourceNodes.sends.set(sendId, sendGain);
    }

    return sendId;
  }

  /**
   * Updates the level of an existing send
   */
  updateSend(fromId: string, toId: string, level: number): void {
    const sendId = `send_${fromId}_${toId}`;
    const sourceNodes =
      fromId === "master" ? this.masterChannel : this.channels.get(fromId);
    const sendGain = sourceNodes?.sends.get(sendId);

    if (sendGain) {
      sendGain.gain.value = level;
    }
  }

  /**
   * Removes and disposes of a send
   */
  removeSend(fromId: string, toId: string): void {
    const sendId = `send_${fromId}_${toId}`;
    const sourceNodes =
      fromId === "master" ? this.masterChannel : this.channels.get(fromId);
    const sendGain = sourceNodes?.sends.get(sendId);

    if (sendGain) {
      sendGain.dispose();
      sourceNodes?.sends.delete(sendId);
    }
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
  }

  /**
   * Gets a channel's send gain nodes
   */
  getSends(channelId: string): Map<string, Tone.Gain> {
    return channelId === "master"
      ? (this.masterChannel?.sends ?? new Map())
      : (this.channels.get(channelId)?.sends ?? new Map());
  }
}
