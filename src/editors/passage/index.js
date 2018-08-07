/*
A modal dialog for editing a single passage.
*/

const CodeMirror = require('codemirror');
const uuid = require('tiny-uuid');
const Vue = require('vue');
const locale = require('../../locale');
const { thenable } = require('../../vue/mixins/thenable');
const { changeLinksInStory, updatePassage } = require('../../data/actions/passage');
const { loadFormat } = require('../../data/actions/story-format');
const { passageDefaults, passageADefaults,passageUDefaults,passageLDefaults, passageXDefaults } = require('../../data/store/story');
const { createPassageAtS } = require('../../story-edit-view');
const { updateStory } = require('../../data/actions/story');
glo = 0;

require('codemirror/addon/display/placeholder');
require('codemirror/addon/hint/show-hint');
require('../../codemirror/prefix-trigger');

require('./index.less');

//turn string into html 
function htmlize(text,edited){

	
	stopwords = ['{N}','{VALUE}','[]','{X, Y, Z}', '{NAME}','{NextNodeTitle}'];

	tab = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
	i = 0;
	while (i<1000){
		text = text.replace('\t',tab);
		i = i + 1;
	}
	i = 0;
	while (i<1000){
		text = text.replace('\n','<br>');
		i = i + 1;
	}

	i = 0;
	while (i<1000){
		text = text.replace('{INSERT DIALOGUE HERE}', '<field>dia</field>');
		i = i + 1;
	}
	i = 0;
	while (i<1000){
		text = text.replace('<field>dia</field>','<field>{INSERT DIALOGUE HERE}</field>');
		i = i +1;	
	}
	//console.log(edited);
	if (edited){
		newtext ='';
		
		lines = text.split('<br>');
		i = 0;
		lines.forEach(l=>{
			wbools = [];
			stopwords.forEach(w=>{
				if (l.includes(w) && l.includes('$')){
					wbools.push('T');
					//console.log(w);
				}else if(l.includes('$') && !l.includes(w)){
					
					wbools.push('F');
				}
			});
		
		//console.log(wbools);
		if (wbools.includes('T')){
			//line has not been edited
			l = '<br>' + l.replace(l, '<trans>' + l +'</trans>');
			


		}else{
		//this.passage.edited = true;
			toks = l.split(' ');
			toks.forEach(tk=>{
				if (tk.includes('$')){
					l = l.replace(tk, tk + '</var>');
					l = l.replace('$','<var>$');
				}
			});
			l = l.replace('{NAME}', '<field>nam</field>');
			l = l.replace('{VALUE}', '<field>val</field>');
			l = l.replace('[]', '<field>bra</field>');
			l = l.replace('<field>bra</field>', '<field>[]</field>');
			l = l.replace('{N}', '<field>n</field>');
			l = l.replace('{X, Y, Z}', '<field>xyz</field>');
			l = l.replace('{NextNodeTitle}', '<field>next</field>');
			l = l.replace('<field>nam</field>','<field>{NAME}</field>');
			l = l.replace('<field>val</field>','<field>{VALUE}</field>');
			l = l.replace('<field>n</field>','<field>{N}</field>');
			l = l.replace('<field>xyz</field>','<field>{X, Y, Z}</field>');
			l = l.replace('<field>next</field>','<field>{NextNodeTitle}</field>');
			if (i==0){
				l = l;
			}else{
				l = '<br>' + l;
			}
			i = i + 1;
			
		}

		newtext = newtext + l;
		
	});

	//console.log(newtext);
		

		//newtext = transluce(newtext);
	}else{
		words = text.split(' ');
		words.forEach(w=>{
			if(w.includes('$')){
				w_old = w;
				w = w.replace('$','<var>');
				w = w + '</var>';
				text = text.replace(w_old,w);
			}
		});
	
		i = 0;
		while (i<1000){
			text = text.replace('<var>','<varHook>$');
			i = i +1;
		}
	
		i = 0;
		while (i<1000){
			text = text.replace('<varHook>','<var>');
			i = i +1;
		}
	
		i = 0;
		while (i<1000){
			text = text.replace('{NAME}', '<field>nam</field>');
			text = text.replace('[]', '<field>bra</field>');
			text = text.replace('{VALUE}', '<field>val</field>');
			text = text.replace('{N}', '<field>n</field>');
			text = text.replace('{X, Y, Z}', '<field>xyz</field>');
			text = text.replace('{NextNodeTitle}', '<field>next</field>');
			//text = text.replace('{INSERT DIALOGUE HERE}', '<field>dia</field>');
			i = i + 1;
		}
	
		i = 0;
		while (i<1000){
			text = text.replace('<field>nam</field>','<field>{NAME}</field>');
			text = text.replace('<field>bra</field>', '<field>[]</field>');
			text = text.replace('<field>val</field>','<field>{VALUE}</field>');
			text = text.replace('<field>n</field>','<field>{N}</field>');
			text = text.replace('<field>xyz</field>','<field>{X, Y, Z}</field>');
			text = text.replace('<field>next</field>','<field>{NextNodeTitle}</field>');
			//text = text.replace('<field>dia</field>','<field>{INSERT DIALOGUE HERE}</field>');
			i = i + 1;
		}
	
		
		newtext = text;
	}


	/*i = 0;
	lines.forEach(l=>{
		if (i>0){
			l = '<line>' + '<br>' + l + '</line>';
		}
		i = i + 1;
		newtext= newtext + l;
	});*/
	return newtext;
}

function transluce(text){

	stopwords = ['{N}','{VALUE}','[]','{X, Y, Z}', '{NAME}','{NextNodeTitle}'];
	
	lines = text.split('\n')
	newtext = '';
	wbools = [];
	lines.forEach(line=>{
		stopwords.forEach(w=>{
			if (line.includes(w) && line.includes('$')){
				wbools.push('T')

				/*
				line = line.replace('<var>','</trans><trans>');
				line = line.replace('</var>','</trans>');
				line = line.replace('<field>','<trans>');
				line = line.replace('</field>','</trans><trans>');*/
				

			}else{
				wbools.push('F');
			}

		});
		if(wbools.includes('T')){
			newLine = 'STARTINGHOOK' + line + 'ENDINGHOOK';
		}else{
			newLine = line ;
		}
		newtext = newtext + newLine + '\n';

	});
	
	i = 0;
	while (i<1000){
		newtext = newtext.replace('STARTINGHOOK','<trans>');
		newtext = newtext.replace('ENDINGHOOK','</trans>');

		i = i +1;
	}
	return newtext;
	

}

function hasBeenEdited(text){
	
	stopwords = ['{N}','{VALUE}','[]','{X, Y, Z}', '{NAME}','{NextNodeTitle}'];
	
	lines = text.split('\n');
	
	lbools = [];
	lines.forEach(l=>{
		wbools = [];
		if (l.includes('$')){
			stopwords.forEach(w=>{
				if (l.includes(w)){
					wbools.push('T');
				} else{
					wbools.push('F');
				}
			});
			console.log(wbools);
			if (!wbools.includes('T')){
				lbools.push('E');//edited
			}else{
				lbools.push('N');
			}
		}
		
	});


	if(lbools.includes('E')){
		return true;
	}else{
		return false;
	}
} 

function dehtmlize(text){
	i = 0;
	if(text.includes('<line>')){
		//console.log('goood');
	}
	while(i<1000){
		//text = text.replace('<line>','');
		//text = text.replace('</line>','');
		text = text.replace('<var>','');
		text = text.replace('</var>','');
		text = text.replace('<field>','');
		text = text.replace('</field>','');
		text = text.replace('<trans>','');
		text = text.replace('</trans>','');
		i = i +1;
	}
	
	tab = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
	i = 0;
	while (i<100){
		text = text.replace(tab,'\t');
		i = i + 1;
	}
	i = 0;
	while (i<100){
		text = text.replace('<br>','\n');
		i = i + 1;
	}


	

	newtext = text;
	return newtext;
}


/*
Expose CodeMirror to story formats, currently for Harlowe compatibility.
*/

window.CodeMirror = CodeMirror;

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		passageId: '',
		storyId: '',
		oldWindowTitle: '',
		userPassageName: '',
		saveError: '',
		origin: null
	}),

	computed: {
		cmOptions() {
			return {
				placeholder: locale.say(
					'Enter the body text of your passage here. To link to another ' +
					'passage, put two square brackets around its name, [[like ' +
					'this]].'
				),
				prefixTrigger: {
					prefixes: ['[[', '->'],
					callback: this.autocomplete.bind(this)
				},
				extraKeys: {
					'Ctrl-Space': this.autocomplete.bind(this)
				},
				indentWithTabs: true,
				lineWrapping: true,
				lineNumbers: false,
				mode: 'text'
			};
		},

		parentStory() {
			return this.allStories.find(story => story.id === this.storyId);
		},

		passage() {
			return this.parentStory.passages.find(
				passage => passage.id === this.passageId
			);
		},

		userPassageNameValid() {
			return !(this.parentStory.passages.some(
				passage => passage.name === this.userPassageName &&
					passage.id !== this.passage.id
			));
		},
		
		autocompletions() {
			return this.parentStory.passages.map(passage => passage.name);
		}
	},

	methods: {

		breed(){
			
			text = dehtmlize(document.getElementById('ptext').innerHTML);
			origName =  'Avatar';
			nameIndex = 1;
			let story = this.parentStory;
			
			do {
				nameIndex++;
				oldName = origName + '' + nameIndex;
			}
			while
				(story.passages.find(p => p.name === oldName));
			
			oldtop = this.passage.top + 100;
			oldleft = this.passage.left;
			let props = {name: oldName, left: oldleft, top: oldtop}
			let newPassage = Object.assign(
				{
					id: uuid()
				},
				passageDefaults,
				props
			);
			newPassage.text = text;
			newPassage.story = story.id;
			newPassage.tags = ['blue'];
			newPassage.edited = this.passage.edited;
			story.passages.push(newPassage);
			toUpdate =  dehtmlize(document.getElementById('ptext').innerHTML);
			toUpdate = toUpdate.split('[[')[0] + '[[' + oldName + ']]';
			if (this.passage.saved == false){
				prev = this.passage;
			}else{
				prev = prev;
				
			}
			this.updatePassage(
				this.parentStory.id,
				prev.id,
				{ text: toUpdate }
			);				
			document.getElementById('ptext').innerHTML = htmlize(newPassage.text,newPassage.edited);
			console.log(document.getElementById("passageName").innerHTML);
			console.log(newPassage.name);
			document.getElementById("passageName").innerHTML = newPassage.name;
			story.lastUpdate = new Date();
			prev = newPassage;	
			
			this.passage.saved = true;
			

/*
			this.$broadcast('drop-down-close');
			new PassageEditor({
				data: {
					passageId: newPassage.id,
					storyId: story.id,
					origin: this.$el
				},
				store: this.$store,
				storyFormat: {
					name: this.parentStory.storyFormat,
					version: this.parentStory.storyFormatVersion
				}
			})
			.$mountTo(document.body)
*/
		},		

		saveTags(tags) {
			this.updatePassage(
				this.parentStory.id,
				this.passage.id,
				{ tags: tags }
			);
		},

		dialogDestroyed() {
			console.log(document.getElementById('ptext').innerHTML);
			if (hasBeenEdited(dehtmlize(document.getElementById('ptext').innerHTML))){
				this.passage.edited = true;
			}else{
				this.passage.edited = false;
			}
			//console.log(document.getElementById('ptext').innerHTML);
			console.log(this.passage.saved);
			if (1 == 0){
				this.updatePassage(
					this.parentStory.id,
					this.passage.id,
					//deHtmlize...
					{ text: dehtmlize(document.getElementById('ptext').innerHTML) }
				);	
			}
			//console.log(document.getElementById('ptext').innerHTML);
			this.$destroy();
		},

		dialogDestroyed2() {
			console.log(document.getElementById('ptext').innerHTML);
			if (hasBeenEdited(dehtmlize(document.getElementById('ptext').innerHTML))){
				this.passage.edited = true;
			}else{
				this.passage.edited = false;
			}
			//console.log(document.getElementById('ptext').innerHTML);
			this.updatePassage(
				this.parentStory.id,
				this.passage.id,
				//deHtmlize...
				{ text: dehtmlize(document.getElementById('ptext').innerHTML) }
			);
			//console.log(document.getElementById('ptext').innerHTML);
			this.$destroy();
		},

		canClose() {
			if (this.userPassageNameValid) {
				if (this.userPassageName !== this.passage.name) {
					this.changeLinksInStory(
						this.parentStory.id,
						this.passage.name,
						this.userPassageName
					);

					this.updatePassage(
						this.parentStory.id,
						this.passage.id,
						{ name: this.userPassageName }
					);
				}

				return true;
			}

			return false;
		}
	},

	ready() {
		this.userPassageName = this.passage.name;
		//console.log(this.passage.edited);
		
		this.passage.saved = false;
		document.getElementById('ptext').innerHTML = htmlize(this.passage.text,this.passage.edited);
		
		
		/* Update the window title. */

		this.oldWindowTitle = document.title;
		document.title = locale.say('Editing \u201c%s\u201d', this.passage.name);

		/*
		Load the story's format and see if it offers a CodeMirror mode.
		*/

		if (this.$options.storyFormat) {
			this.loadFormat(
				this.$options.storyFormat.name,
				this.$options.storyFormat.version
			).then(format => {
				let modeName = format.name.toLowerCase();

				/* TODO: Resolve this special case with PR #118 */

				if (modeName === 'harlowe') {
					modeName += `-${/^\d+/.exec(format.version)}`;
				}

				if (modeName in CodeMirror.modes) {
					/*
					This is a small hack to allow modes such as Harlowe to
					access the full text of the textarea, permitting its lexer
					to grow a syntax tree by itself.
					*/

					CodeMirror.modes[modeName].cm = this.$refs.codemirror.$cm;

					/*
					Now that's done, we can assign the mode and trigger a
					re-render.
					*/

					this.$refs.codemirror.$cm.setOption('mode', modeName);
				}
			});
		}

		/*
		Set the mode to the default, 'text'. The above promise will reset it if
		it fulfils.
		*/

		this.$refs.codemirror.$cm.setOption('mode', 'text');

		/*
		Either move the cursor to the end or select the existing text, depending
		on whether this passage has only default text in it.
		*/

		if (this.passage.text === passageDefaults.text || this.passage.text === passageADefaults.text || this.passage.text === passageUDefaults.text || this.passage.text === passageXDefaults.text || this.passage.text === passageLDefaults.text){
			this.$refs.codemirror.$cm.execCommand('selectAll');
		}
		else {
			this.$refs.codemirror.$cm.execCommand('goDocEnd');
		}
	},

	destroyed() {
		document.title = this.oldWindowTitle;
	},

	components: {
		'code-mirror': require('../../vue/codemirror'),
		'modal-dialog': require('../../ui/modal-dialog'),
		'tag-editor': require('./tag-editor')
	},

	vuex: {
		actions: {
			changeLinksInStory,
			updatePassage,
			loadFormat
		},

		getters: {
			allStories: state => state.story.stories
		}
	},

	mixins: [thenable]
});
