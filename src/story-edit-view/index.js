/* The main view where story editing takes place. */
const uuid = require('tiny-uuid');
const values = require('lodash.values');
const storyStore = require('../data/store/story');
const Vue = require('vue');
const { confirm } = require('../dialogs/confirm');
const { createPassage,createPassageA,createPassageX,createPassageZ, createPassageS, createPassageL,createPassageU,  deletePassage, positionPassage, updatePassage } = require('../data/actions/passage');
//const { createPassageA, deletePassageA, positionPassageA, updatePassageA } = require('../data/actions/passageA');
//const { createPassageU, deletePassageU, positionPassageU, updatePassageU } = require('../data/actions/passageU');
//const { createPassageL, deletePassageL, positionPassageL, updatePassageL } = require('../data/actions/passageL');
const { loadFormat } = require('../data/actions/story-format');
const { updateStory } = require('../data/actions/story');
const domEvents = require('../vue/mixins/dom-events');
const locale = require('../locale');
const { passageDefaults, passageADefaults, passageLDefaults, passageUDefaults, passageXDefaults } = require('../data/store/story');
const zoomSettings = require('./zoom-settings');
var counter = 0;
var nameIndexA = 0;
var nameIndexU = 0;
var nameIndexX = 0;
var nameIndexL = 0;
var nameIndexC = 0;

require('./index.less');

/*
A memoized, sorted array of zoom levels used when zooming in or out.
*/

const zoomLevels = values(zoomSettings).sort();

module.exports = Vue.extend({
	template: require('./index.html'),

	/* The id of the story we're editing is provided by the router. */

	props: {
		storyId: {
			type: String,
			required: true
		}
	},

	data: () => ({
		/*
		The window's width and height. Our resize() method keeps this in sync
		with the DOM.
		*/

		winWidth: window.innerWidth,
		winHeight: window.innerHeight,

		/*
		The calculated width and height we maintain to allow the user to
		always have space below and to the right of passages in the story
		map.
		*/

		width: 0,
		height: 0,

		/*
		The regular expression that matching passages should highlight.
		If null, none should highlight.
		*/

		highlightRegexp: null,

		/*
		The offset that selected passages should be displayed at
		temporarily, to show feedback as the user drags passages around.
		*/

		screenDragOffsetX: 0,
		screenDragOffsetY: 0
	}),

	computed: {
		/*
		Sets our width and height to:
		* the size of the browser window
		* the minimum amount of space needed to enclose all existing
		passages
		
		... whichever is bigger, plus 50% of the browser window's
		width and height, so that there's always room for the story to
		expand.
		*/

		cssDimensions() {
			let width = this.winWidth;
			let height = this.winHeight;
			let passagesWidth = 0;
			let passagesHeight = 0;

			this.story.passages.forEach(p => {
				const right = p.left + p.width;
				const bottom = p.top + p.height;

				if (right > passagesWidth) {
					passagesWidth = right;
				}

				if (bottom > passagesHeight) {
					passagesHeight = bottom;
				}
			});

			width = Math.max(passagesWidth * this.story.zoom, this.winWidth);
			height = Math.max(passagesHeight * this.story.zoom, this.winHeight);

			/*
			Give some space below and to the right for the user to add
			passages.
			*/

			width += this.winWidth / 2;
			height += this.winHeight / 2;

			return {
				width: width + 'px',
				height: height + 'px'
			};
		},

		/* Our grid size -- for now, constant. */

		gridSize() {
			return 25;
		},

		/*
		Returns an array of currently-selected <passage-item> components. This
		is used by the marquee selector component to do additive selections
		by remembering what was originally selected.
		*/

		selectedChildren() {
			return this.$refs.passages.filter(p => p.selected);
		},

		/*
		An array of <passage-item> components and their link positions,
		indexed by name.
		*/

		passagePositions() {
			return this.$refs.passages.reduce(
				(result, passageView) => {
					result[passageView.passage.name] = passageView.linkPosition;
					return result;
				},

				{}
			);
		},

		story() {
			return this.allStories.find(story => story.id === this.storyId);
		},

		/* A human readable adjective for the story's zoom level. */

		zoomDesc() {
			return Object.keys(zoomSettings).find(
				key => zoomSettings[key] === this.story.zoom
			);
		}
	},

	watch: {
		'story.name': {
			handler(value) {
				document.title = value;
			},

			immediate: true
		},

		'story.zoom': {
			handler(value, old) {
				/*
				Change the window's scroll position so that the same logical
				coordinates are at its center.
				*/
				
				const halfWidth = window.innerWidth / 2;
				const halfHeight = window.innerHeight / 2;
				const logCenterX = (window.scrollX + halfWidth) / old;
				const logCenterY = (window.scrollY + halfHeight) / old;

				window.scroll(
					(logCenterX * value) - halfWidth,
					(logCenterY * value) - halfHeight
				);
			}
		}
	},

	ready() {
		this.resize();
		this.on(window, 'resize', this.resize);
		this.on(window, 'keyup', this.onKeyup);
		
		if (this.story.passages.length === 0) {
			this.createPassageAt();
			
		}

	},

	methods: {
		resize() {
			this.winWidth = window.innerWidth;
			this.winHeight = window.innerHeight;
		},

		zoomIn(wraparound) {
			let zoomIndex = zoomLevels.indexOf(this.story.zoom);

			if (zoomIndex === 0) {
				if (wraparound) {
					this.updateStory(
						this.story.id,
						{ zoom: zoomLevels[zoomIndex.length - 1] }
					);
				}
			}
			else {
				this.updateStory(
					this.story.id,
					{ zoom: zoomLevels[zoomIndex - 1] }
				);
			}
		},

		zoomOut(wraparound) {
			let zoomIndex = zoomLevels.indexOf(this.story.zoom);

			if (zoomIndex === zoomLevels.length - 1) {
				if (wraparound) {
					this.updateStory(
						this.story.id,
						{ zoom: zoomLevels[0] }
					);
				}
			}
			else {
				this.updateStory(
					this.story.id,
					{ zoom: zoomLevels[zoomIndex + 1] }
				);
			}
		},

		/*
		Creates a passage, optionally at a certain position onscreen. If
		unspecified, this does so at the center of the page. This also
		handles positioning the passage so it doesn't overlap others.
		*/

		createPassageAt(name, top, left) {
			/*
			If we haven't been given coordinates, place the new passage at
			the center of the window. We start by finding the center point
			of the browser window in logical coordinates, e.g. taking into
			account the current zoom level. Then, we move upward and to the
			left by half the dimensions of a passage in logical space.
			*/

			if (!left) {
				left = (window.pageXOffset + window.innerWidth / 2)
					/ this.story.zoom;
				left -= passageDefaults.width;
			}

			if (!top) {
				top = (window.pageYOffset + window.innerHeight / 2)
					/ this.story.zoom;
				top -= passageDefaults.height;
			}

			/*
			Make sure the name is unique. If it's a duplicate, we add a
			number at the end (e.g. "Untitled Passage 2", "Untitled Passage
			3", and so on.
			*/

			name = name || locale.say('Synopsis');

			if (this.story.passages.find(p => p.name === name)) {
				const origName = name;
				let nameIndex = 0;

				do {
					nameIndex++;
					name = origName + '' + nameIndex;
				}
				while
					(this.story.passages.find(p => p.name === name));
			}

			/* Add it to our collection. */



			this.createPassage(this.story.id, { name, left, top });

			/*
			Then position it so it doesn't overlap any others, and save it
			again.
			*/
			
			this.positionPassage(
				this.story.id,
				this.story.passages.find(p => p.name === name).id,
				this.gridSize
			);
		},

		createPassageAtL(name, top, left) {
			/*
			If we haven't been given coordinates, place the new passage at
			the center of the window. We start by finding the center point
			of the browser window in logical coordinates, e.g. taking into
			account the current zoom level. Then, we move upward and to the
			left by half the dimensions of a passage in logical space.
			*/

			if (!left) {
				left = (window.pageXOffset + window.innerWidth / 2)
					/ this.story.zoom;
				left -= passageLDefaults.width;
			}

			if (!top) {
				top = (window.pageYOffset + window.innerHeight / 2)
					/ this.story.zoom;
				top -= passageLDefaults.height;
			}

			/*
			Make sure the name is unique. If it's a duplicate, we add a
			number at the end (e.g. "Untitled Passage 2", "Untitled Passage
			3", and so on.
			*/

			name = name || locale.say('Logic');
			const origName = name;
			let nameIndex = 0;

			do {
				nameIndex++;
				name = origName + '' + nameIndex;
			}
			while
				(this.story.passages.find(p => p.name === name));
			

			/* Add it to our collection. */

			this.createPassageL(this.story.id, { name, left, top });

			/*
			Then position it so it doesn't overlap any others, and save it
			again.
			*/
			
			this.positionPassage(
				this.story.id,
				this.story.passages.find(p => p.name === name).id,
				this.gridSize
			);
		},
		createPassageAtX(name, top, left) {
			/*
			If we haven't been given coordinates, place the new passage at
			the center of the window. We start by finding the center point
			of the browser window in logical coordinates, e.g. taking into
			account the current zoom level. Then, we move upward and to the
			left by half the dimensions of a passage in logical space.
			*/

			if (!left) {
				left = (window.pageXOffset + window.innerWidth / 2)
					/ this.story.zoom;
				left -= passageXDefaults.width;
			}

			if (!top) {
				top = (window.pageYOffset + window.innerHeight / 2)
					/ this.story.zoom;
				top -= passageXDefaults.height;
			}

			/*
			Make sure the name is unique. If it's a duplicate, we add a
			number at the end (e.g. "Untitled Passage 2", "Untitled Passage
			3", and so on.
			*/

			name = name || locale.say('Universal');

			if (this.story.passages.find(p => p.name === name)) {
				const origName = name;
				

				do {
					nameIndexX++;
					name = origName + '' + nameIndexX;
				}
				while
					(this.story.passages.find(p => p.name === name));
			}

			/* Add it to our collection. */

			this.createPassageX(this.story.id, { name, left, top });

			/*
			Then position it so it doesn't overlap any others, and save it
			again.
			*/
			
			this.positionPassage(
				this.story.id,
				this.story.passages.find(p => p.name === name).id,
				this.gridSize
			);
		},
		createPassageAtZ(name, top, left) {
			bags = [];
			counter = 0;


			counter++;
			counterStr = counter.toString();
			this.story.passages.forEach(p => {
				if(p.selected == true){
					top = p.top;
					left = p.left + 0.25*p.left;
					top = p.top;
					name = p.name;
					toks = name.split('Copy');
					name = toks[0]; 
					name = name + 'Copy' + counterStr;
					if (this.story.passages.find(pp => pp.name === name)) {
						do{
							counter++;
							counterStr = counter.toString();
							tokz = name.split('Copy');
							name = tokz[0]; 
							name = name + 'Copy' + counterStr;
						}
						while
							((this.story.passages.find(p => p.name === name)));	
					}
					else if(bags.find(bb => bb.name === name)){
						counter++;
						counterStr = counter.toString();
						tokzz = name.split('Copy');
						name = tokzz[0]; 
						name = name + 'Copy' + counterStr;
					}
					//nom = p.name;
					newPassage = Object.assign(
						{id: uuid()},
						storyStore.passageDefaults,
						{name, top, left}
					);
					newText = p.text;
					originalText = p.text;
					if(newText.match(/\[\[.*?\]\]/g) != null){
						newText = newText.match(/\[\[.*?\]\]/g);
						newText.forEach( tex => { 
							tex = tex.replace("[ [[","");
							tex = tex.replace("]] ]","");
							tex = tex.replace("[[","");
							tex = tex.replace("]]","");	
							tokens = tex.split('Copy');
							texC = tokens[0];	
							originalText = originalText.replace(tex,texC + 'Copy'+counterStr);									
							newPassage.text = originalText;
						});}
					else{
						newPassage.text = originalText;
					}
					newPassage.tags = p.tags; 
					bags.push(newPassage);
					this.story.passages.push(newPassage);
				}
			});
		},

		createPassageAtS(name, top, left) {

			counter = 0;
			counter++;
			counterStr = counter.toString();
			storyLen = this.story.passages.length;
			last = null;
			var indx = storyLen -1;
			var indicator = false;
			var lastPos = 0;
			while (indx > 0){
				current = this.story.passages[indx];
				ctext = current.text;
				if (ctext.includes("AVATARS:") && ctext.includes("SCREEN:")){
					last = this.story.passages[indx];
					lastPos = indx;
					indx = 0;
					indicator = true;
				}
				indx = indx - 1;
			}
			oldName = last.name;
			oldText = last.text;
			top = last.top + 125;
			left = last.left;
			origName =  'Avatar';
			nameIndex = 1;
			
			do {
				nameIndex++;
				oldName = origName + '' + nameIndex;
			}
			while
				(this.story.passages.find(p => p.name === oldName));

			newPassage = Object.assign(
				{id: uuid()},
				storyStore.passageDefaults,
				{oldName, top, left}
			);
			newPassage.text = oldText;
			newPassage.name = oldName;
			console.log("indicator");
			console.log(indicator);
			if (indicator == true){
				lastText = this.story.passages[lastPos].text;
				lines = lastText.split("\n");
				newlasttext = '';
				lines.forEach(l => {
					if (l.includes("[[")){
						l = '[['+ oldName +']]';
					}
					newlasttext = newlasttext + l + '\n';
				});
				this.story.passages[lastPos].text = newlasttext;

				lines = lastText.split("\n");
				newpasstext = '';
				lines.forEach(l => {
					if (l.includes("[[")){
						l = '[[{NextNodeTitle}]]';
					}
					newpasstext = newpasstext + l + '\n';
				});
				newPassage.text = newpasstext;
				newPassage.tags = last.tags; 
				this.story.passages.push(newPassage);
				indicator = false;
			}

		},

		createPassageAtA(name, top, left) {
			/*
			If we haven't been given coordinates, place the new passage at
			the center of the window. We start by finding the center point
			of the browser window in logical coordinates, e.g. taking into
			account the current zoom level. Then, we move upward and to the
			left by half the dimensions of a passage in logical space.
			*/

			if (!left) {
				left = (window.pageXOffset + window.innerWidth / 2)
					/ this.story.zoom;
				left -= passageADefaults.width;
			}

			if (!top) {
				top = (window.pageYOffset + window.innerHeight / 2)
					/ this.story.zoom;
				top -= passageADefaults.height;
			}

			/*
			Make sure the name is unique. If it's a duplicate, we add a
			number at the end (e.g. "Untitled Passage 2", "Untitled Passage
			3", and so on.
			*/

			name = name || locale.say('Avatar');

			const origName = name;
			let nameIndex = 0;

			do {
				nameIndex++;
				name = origName + '' + nameIndex;
			}
			while
				(this.story.passages.find(p => p.name === name));
			

			/* Add it to our collection. */

			this.createPassageA(this.story.id, { name, left, top });

			/*
			Then position it so it doesn't overlap any others, and save it
			again.
			*/
			
			this.positionPassage(
				this.story.id,
				this.story.passages.find(p => p.name === name).id,
				this.gridSize
			);
		},

		createPassageAtU(name, top, left) {
			/*
			If we haven't been given coordinates, place the new passage at
			the center of the window. We start by finding the center point
			of the browser window in logical coordinates, e.g. taking into
			account the current zoom level. Then, we move upward and to the
			left by half the dimensions of a passage in logical space.
			*/

			if (!left) {
				left = (window.pageXOffset + window.innerWidth / 2)
					/ this.story.zoom;
				left -= passageUDefaults.width;
			}

			if (!top) {
				top = (window.pageYOffset + window.innerHeight / 2)
					/ this.story.zoom;
				top -= passageUDefaults.height;
			}

			/*
			Make sure the name is unique. If it's a duplicate, we add a
			number at the end (e.g. "Untitled Passage 2", "Untitled Passage
			3", and so on.
			*/

			name = name || locale.say('User');
			const origName = name;
			let nameIndex = 0;

			do {
				nameIndex++;
				name = origName + '' + nameIndex;
			}
			while
				(this.story.passages.find(p => p.name === name));
			
			/* Add it to our collection. */

			this.createPassageU(this.story.id, { name, left, top });

			/*
			Then position it so it doesn't overlap any others, and save it
			again.
			*/
			
			this.positionPassage(
				this.story.id,
				this.story.passages.find(p => p.name === name).id,
				this.gridSize
			);
		},


		/*
		Creates a passage under the cursor in response to a
		webkitmouseforcedown event. At the time of writing, this is a
		Mac-specific feature, but can be extended once standards catch up.
		*/
		
		onMouseForceDown(e) {
			let top = (e.pageY / this.story.zoom) -
				(passageDefaults.height / 2);
			let left = (e.pageX / this.story.zoom) -
				(passageDefaults.width / 2);
			
			this.createPassage(null, top, left);
		},

		/*
		Zooms in or out based on a mouse wheel event. The user must hold
		down the Alt or Option key for it to register.
		*/

		onWheel(e) {
			if (e.altKey && !e.ctrlKey) {
				/* Only consider the Y component of the motion. */

				if (e.wheelDeltaY > 0) {
					this.zoomIn(true);
				}
				else {
					this.zoomOut(true);
				}

				e.preventDefault();
			}
		},

		onKeyup(e) {
			/*
			If the key is going anywhere (e.g. into a text field), disregard it.
			*/

			let target = e.target;

			while (target) {
				if (target.nodeName === 'INPUT' || target.nodeName === 'TEXTAREA') {
					return;
				}

				target = target.parentNode;
			}

			switch (e.keyCode) {
				/* Plus key */

				case 187:
					this.zoomOut();
					break;
				
				/* Minus key */

				case 189:
					this.zoomIn();
					break;

				/* Delete key */

				case 46: {
					const toDelete =
						this.story.passages.filter(p => p.selected);

					if (toDelete.length === 0) {
						return;
					}

					const message = locale.sayPlural(
						`Are you sure you want to delete all selected passages This cannot be undone.`,
						`Are you sure you want to delete all selected passages? This cannot be undone.`,
						toDelete.length,
						toDelete[0].name
					);

					confirm({
						message,
						buttonLabel: '<i class="fa fa-trash-o"></i> ' + locale.say('Delete'),
						buttonClass: 'danger'
					}).then(() => {
						toDelete.forEach(
							p => this.deletePassage(this.story.id, p.id)
						);
					});
					break;
				}
			}
		}
	},

	events: {
		/*
		Our children (e.g. the search field can tell us to change what the
		highlight filter should be.
		*/

		'highlight-regexp-change'(value) {
			this.highlightRegexp = value;
		},
		
		/*
		A hook into our createPassage() method for child components.
		*/

		'passage-create'(name, left, top) {
			this.createPassageAt(name, left, top);
		},
		'passage-createA'(name, left, top) {
			this.createPassageAtA(name, left, top);
		},
		'passage-create-same'(name, left, top) {
			this.createPassageAtS(name, left, top);
		},
		'passage-createX'(name, left, top) {
			this.createPassageAtX(name, left, top);
		},
		'passage-createZ'(name, left, top) {
			this.createPassageAtZ(name, left, top);
		},
		'passage-createU'(name, left, top) {
			this.createPassageAtU(name, left, top);
		},
		'passage-createL'(name, left, top) {
			this.createPassageAtL(name, left, top);
		},

		/*
		A child will dispatch this event to us as it is dragged around. We
		set a data property here and other selected passages react to it by
		temporarily shifting their onscreen position.
		*/

		'passage-drag'(xOffset, yOffset) {
			if (this.story.snapToGrid) {
				this.screenDragOffsetX = Math.round(xOffset / this.gridSize) *
					this.gridSize;
				this.screenDragOffsetY = Math.round(yOffset / this.gridSize) *
					this.gridSize;
			}
			else {
				this.screenDragOffsetX = xOffset;
				this.screenDragOffsetY = yOffset;
			}
		},

		/*
		A child will dispatch this event at the completion of a drag. We
		pass this onto our children, who use it as a chance to save what was
		a temporary change in the DOM to their model.
		*/

		'passage-drag-complete'(xOffset, yOffset) {
			this.screenDragOffsetX = 0;
			this.screenDragOffsetY = 0;

			if (this.story.snapToGrid) {
				xOffset = Math.round(xOffset / this.gridSize) * this.gridSize;
				yOffset = Math.round(yOffset / this.gridSize) * this.gridSize;
			}

			this.$broadcast('passage-drag-complete', xOffset, yOffset);
		},

		/*
		Positions a passage on behalf of a child component. This needs to be
		here, as opposed to a direct Vuex action, because this takes into
		account the grid size.
		*/

		'passage-position'(passage, options) {
			this.positionPassage(
				this.story.id,
				passage.id,
				this.gridSize,
				options.ignoreSelected && (passage =>
					!this.selectedChildren.some(view =>
						view.passage.id === passage
					))
			);
		}
	},

	components: {
		'link-arrows': require('./link-arrows'),
		'passage-item': require('./passage-item'),
		'story-toolbar': require('./story-toolbar'),
		'marquee-selector': require('./marquee-selector')
	},

	vuex: {
		actions: {
			createPassage,
			createPassageX,
			createPassageZ,
			createPassageS,
			createPassageA,
			createPassageU,
			createPassageL,
			deletePassage,
			loadFormat,
			positionPassage,
			updatePassage,
			updateStory
		},

		getters: {
			allFormats: state => state.storyFormat.formats,
			allStories: state => state.story.stories,
			defaultFormatName: state => state.pref.defaultFormat
		}
	},

	mixins: [domEvents]
});
