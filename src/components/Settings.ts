import contrib, { Widgets } from 'blessed-contrib';
import { RootStore } from '../stores/RootStore';
import { reaction } from 'mobx';
import { debounce } from 'lodash';

interface TreeItems {
	[key: string]: {
		name: string;
		onSelect: () => void;
	};
}

const bitrates = [
	250,
	500,
	750,
	1000,
	1250,
	1500,
	1750,
	2000,
	2250,
	2500,
	2750,
	3000,
	3500,
	4000,
	4500,
	5000,
	5500,
	6000,
	6500,
	7000,
	7500,
	8000,
];

interface Resolution {
	width: number;
	height: number;
}

const resolutions: Resolution[] = [
	{ width: 1920, height: 1080 },
	{ width: 1280, height: 720 },
	{ width: 960, height: 540 },
	{ width: 640, height: 360 },
];

function resolutionToString(resolution: Resolution) {
	return resolution.width + 'x' + resolution.height;
}

export class Settings {
	private _tree: any;
	private _treeExtended: Map<string, boolean> = new Map();

	constructor(private _rootStore: RootStore, grid: Widgets.GridElement) {
		this._tree = grid.set(0, 0, 1, 1, contrib.tree, {
			fg: 'white',
			selectedFg: 'white',
			selectedBg: 'blue',
			interactive: true,
			label: 'Settings',
			border: { type: 'line', fg: 'cyan' },
		});
		//
		this._tree.on('select', (node: any) => {
			this.onTreeSelect(node);
		});
		//
		this._tree.on('click', () => {
			this._tree.focus();
		});
		//
		//
		//
		this._registerReactions();
		//
		this._tree.focus();
		this._render();
	}

	private onTreeSelect(node: any) {
		if (node.onSelect) {
			node.onSelect();
		}

		if (node.children) {
			const value = !!this._treeExtended.get(node.name);
			this._treeExtended.set(node.name, !value);
		}
	}

	private _registerReactions() {
		const { ndi } = this._rootStore;
		reaction(
			() => {
				return {
					sources: ndi.sources,
					input: JSON.stringify(ndi.input),
					output: JSON.stringify(ndi.output),
				};
			},
			() => {
				this._render();
				this._tree.screen.render();
			},
		);
	}

	private _render() {
		this._tree.setData({
			extended: true,
			children: {
				NDI: {
					extended: !!this._treeExtended.get('NDI'),
					children: {
						InputName: {
							name: 'Input name',
							extended: !!this._treeExtended.get('Input name'),
							children: this._createNdiSourcesChildren(),
							onSelect: () => {
								if (!!this._treeExtended.get('Input name')) {
									// rescan on close
									this._updateNdiSources();
								}
							},
						},
					},
					onSelect: () => {
						if (!!!this._treeExtended.get('NDI')) {
							// rescan on open
							this._updateNdiSources();
						}
					},
				},
				Bitrate: {
					extended: !!this._treeExtended.get('Bitrate'),
					children: this._createBitrateSettings(),
				},
				Resolution: {
					extended: !!this._treeExtended.get('Resolution'),
					children: this._createResolutionSettings(),
				},
				Reset: {
					name: 'Reset to defaults',
					onSelect: debounce(() => {
						this._rootStore.ndi.resetToDefaults();
					}, 500),
				},
			},
		});
	}

	//

	private _updateNdiSources = debounce(() => {
		this._rootStore.ndi.updateNdiSources();
	}, 500);

	private _createNdiSourcesChildren() {
		const { ndi } = this._rootStore;
		const result: TreeItems = {};
		//
		ndi.sources.forEach((source, index) => {
			//
			const desc = {
				name: source.name + ' @ ' + source.ip,
				onSelect: () => {
					this._updateNdiInputName(source.name);
				},
			};
			//
			if (source.name === ndi.input.name) {
				desc.name = '>' + desc.name + '<';
			}
			//
			result['s' + index] = desc;
		});
		//
		result['snone'] = {
			name: !!ndi.input.name ? 'NONE' : '>NONE<',
			onSelect: () => {
				ndi.setInputName(null);
			},
		};
		//
		return result;
	}

	private _updateNdiInputName = debounce((name: string) => {
		this._rootStore.ndi.setInputName(name);
	}, 500);

	//

	private _createBitrateSettings() {
		const result: TreeItems = {};
		const { ndi } = this._rootStore;
		bitrates.forEach((b) => {
			//
			const name = b === ndi.output.bitrate ? '>' + b + 'k<' : b + 'k';
			const desc = {
				name,
				onSelect: () => {
					this._updateBitrate(b);
				},
			};
			result[String(b)] = desc;
		});
		return result;
	}

	private _updateBitrate = debounce((bitrate) => {
		this._rootStore.ndi.setBitrate(bitrate);
	}, 500);

	//

	private _createResolutionSettings() {
		const result: TreeItems = {};
		const { ndi } = this._rootStore;
		resolutions.forEach((r) => {
			const label = resolutionToString(r);
			//
			const selected = resolutionToString({
				width: ndi.output.width!,
				height: ndi.output.height!,
			});
			const name = label === selected ? '>' + label + '<' : label;
			const desc = {
				name,
				onSelect: () => {
					this._updateResolution(r);
				},
			};
			result[label] = desc;
		});
		return result;
	}

	private _updateResolution = debounce((resolution: Resolution) => {
		this._rootStore.ndi.setResolution(resolution.width, resolution.height);
	}, 500);
}
