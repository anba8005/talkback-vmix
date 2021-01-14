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
				Reset: {
					name: 'Reset to defaults',
					onSelect: debounce(() => {
						this._rootStore.ndi.resetToDefaults();
					}, 500),
				},
			},
		});
	}

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
}
