/* The router managing the app's views. */

let Vue = require('vue');
const VueRouter = require('vue-router');
const LocaleView = require('../locale/view');
const StoryEditView = require('../story-edit-view');
const StoryListView = require('../story-list-view');
const WelcomeView = require('../welcome');
const { loadFormat } = require('../data/actions/story-format');
const { publishStoryWithFormat } = require('../data/publish');
const replaceUI = require('../ui/replace');
const store = require('../data/store');

Vue.use(VueRouter);

let TwineRouter = new VueRouter();

TwineRouter.map({
	/*  We connect routes with no params directly to a component. */

	'/locale': {
		component: LocaleView
	},

	'/welcome': {
		component: WelcomeView
	},

	/*
	For routes that take data objects, we create shim components which provide
	appropriate props to the components that do the actual work.
	*/

	'/stories': {
		component: {
			template: '<div><story-list ' +
				':previously-editing="previouslyEditing"></story-list></div>',

			components: { 'story-list': StoryListView },

			data() {
				return {
					previouslyEditing: this.$route.params ?
						this.$route.params.previouslyEditing : ''
				};
			},
		}
	},

	'/stories/:id': {
		component: {
			template: '<div><story-edit :story-id="id"></story-edit></div>',

			components: { 'story-edit': StoryEditView },
			
			data() {
				return { id: this.$route.params.id };
			}
		},
	},

	/*
	These routes require special handling, because we tear down our UI when
	they activate.
	*/

	'/stories/:id/play': {
		component: {
			ready() {
				const state = this.$store.state;
				const story = state.story.stories.find(
					story => story.id === this.$route.params.id
				);

				loadFormat(
					this.$store,
					story.storyFormat,
					story.storyFormatVersion
				).then(format => {
					replaceUI(publishStoryWithFormat(
						state.appInfo,
						story,
						format
					));
				});
			}
		}
	},







	
	'/stories/:id/proofRead': {
		component: {
			ready() {
				const state = this.$store.state;
				const story = state.story.stories.find(
					story => story.id === this.$route.params.id
				);
				defaults = ["NAME","X, Y, Z","X,Y,Z","X , Y, Z","INSERT DIALOGUE HERE","{VALUE}","{}"];
				newL = '';
				story1 = story;
				story1.passages.forEach(p => {
					console.log(p.id);
					newtext = '';
					ptext = p.text;
					var i = 0;
					while (i < 10){
						ptext = ptext.replace("\n\n","\n");
						i = i+1;
					}
					lines = ptext.split("\n");
					lines.forEach(l => {
						spy = false;
						defaults.forEach(d=>{
							if (l.includes(d)){
								spy = true;
								
							}
						});
						if (spy == false){
							newtext = newtext + l + "\n";
						}
						
						
					});
					p.text = newtext;
				});
				loadFormat(
					this.$store,
					state.pref.proofingFormat.name,
					state.pref.proofingFormat.version
				).then(format => {
					replaceUI(publishStoryWithFormat(
						state.appInfo,
						story1,
						format
					));
				});
			}
		}
	},

	'/stories/:id/animations': {
		component: {
			ready() {
				const state = this.$store.state;
				const story = state.story.stories.find(
					story => story.id === this.$route.params.id
				);
				story1 = story;
				newtext = '';
				faceAnims = '';
				bodyAnims = '';
				sceneAnims = '';
				objectAnims = '';
				fAnims = [];
				bAnims = [];
				sAnims = [];
				oAnims = [];


				story1.passages.forEach(p => {
					ptext = p.text;
					lines = ptext.split("\n");
					pre = '';
					lines.forEach(l =>{
						if(l.includes('Scene:')){
							pre = 'Scene';
						}
						if(l.includes('Object')){
							pre = 'Object';
						}
						if(l.includes('Face')){
							pre = 'Face';
						}
						if(l.includes('Body')){
							pre = 'Body';
						}

						if (l.includes("$Anim")){
							var i = 0;
							while (i<10){
								l = l.replace("\t","");
								l = l.replace("  "," ");
								i = i +1;
							}
							words = l.split(" ");
							words.forEach(w => {
								w = w.replace("(","");
								w = w.replace(")","");
								w = pre + w;
								if (w.includes("SceneAnim") && !w.includes("NAME") && !sAnims.includes(w)){
									sceneAnims = sceneAnims + w + '\n';
									sAnims.push(w);
								}
								else if (w.includes("ObjectAnim") && !w.includes("NAME")&& !oAnims.includes(w)){
									objectAnims = objectAnims + w + '\n';
									oAnims.push(w);
								}
								else if (w.includes("FaceAnim") && !w.includes("NAME")&& !bAnims.includes(w)){
									bodyAnims = bodyAnims + w + '\n';
									bAnims.push(w);
								}
								else if (w.includes("BodyAnim") && !w.includes("NAME")&& !fAnims.includes(w)){
									faceAnims = faceAnims + w + '\n';
									fAnims.push(w);
								}

							});	
						}
					
					});
				});
				story1.name = "Animations";
				if (story1.passages.length < 4){
					toPush = story1.passages[0];
					story1.passages.push(toPush);
					story1.passages.push(toPush);
					story1.passages.push(toPush);
					story1.passages.push(toPush);
				}

				p0 = story1.passages[0];
				p1 = story1.passages[1];
				p2 = story1.passages[2];
				p3 = story1.passages[3];

				p0.name = "Scene Animations";
				p0.text = sceneAnims;
				p1.name = "Object Animations";
				p1.text = objectAnims;
				p2.name = "Face Animations";
				p2.text = faceAnims;
				p3.name = "Body Animations";
				p3.text = bodyAnims;

				story1.passages[0] = p0;
				story1.passages[1] = p1;
				story1.passages[2] = p2;
				story1.passages[3] = p3;

				k = 0;
				max = story1.passages.length;
				while (k<max){
					if (k > 3){
						story1.passages[k].name = '';
						story1.passages[k].text = '';
					}
					k = k + 1;
				}

				loadFormat(
					this.$store,
					state.pref.proofingFormat.name,
					state.pref.proofingFormat.version
				).then(format => {
					replaceUI(publishStoryWithFormat(
						state.appInfo,
						story1,
						format
					));
				});
			}
		}
	},

	'/stories/:id/sentences': {
		component: {
			ready() {
				const state = this.$store.state;
				const story = state.story.stories.find(
					story => story.id === this.$route.params.id
				);
				newtext = '';

				story1 =  story;

				sentences = '';
				sss = [];
				sceneAnims = '';
				bodyAnims = '';
				faceAnims = '';
				objectAnims = ''
				var c = 0;
				story1.passages.forEach(p => {
					ptext = p.text;
					pname = p.name;
					ptags = p.tags;
					lines = ptext.split("\n");
					lines.forEach(l =>{
						if (ptags.includes("red") && l.includes("$MicSpeech")  && !l.includes("{VALUE}") && ptext.includes("UserOptions")){
							var i = 0;
							c = c + 1;
							while (i<10){
								l = l.replace("\t","");
								l = l.replace("  "," ");
								i = i +1;
							}
							words = l.split('"');
							w = words[1];
							if (!sss.includes(w)){
								sentences = sentences + c.toString() + " : "+ w + '\n';
								sss.push(w);
							}
							
									
						}
					
					});
				});
				story1.name = "Animations";
				if (story1.passages.length < 4){
					toPush = story1.passages[0];
					story1.passages.push(toPush);
					story1.passages.push(toPush);
					story1.passages.push(toPush);
					story1.passages.push(toPush);
				}

				p0 = story1.passages[0];
				p1 = story1.passages[1];
				p2 = story1.passages[2];
				p3 = story1.passages[3];

				p0.name = '';
				p0.text = sentences;
				p1.name = "Object Animations";
				p1.text = objectAnims;
				p2.name = "Face Animations";
				p2.text = faceAnims;
				p3.name = "Body Animations";
				p3.text = bodyAnims;

				story1.passages[0] = p0;
				story1.passages[1] = p1;
				story1.passages[2] = p2;
				story1.passages[3] = p3;

				k = 0;
				max = story1.passages.length;
				while (k<max){
					if (k > 0){
						story1.passages[k].name = '';
						story1.passages[k].text = '';
					}else{
						story1.passages[k].name = '';
						story1.passages[k].text = p0.text;
					}
					k = k + 1;
				}
				story1.name = "Expected User Answers";
				loadFormat(
					this.$store,
					state.pref.proofingFormat.name,
					state.pref.proofingFormat.version
				).then(format => {
					replaceUI(publishStoryWithFormat(
						state.appInfo,
						story1,
						format
					));
				});
			}
		}
	},


	'/stories/:id/sounds': {
		component: {
			ready() {
				const state = this.$store.state;
				const story = state.story.stories.find(
					story => story.id === this.$route.params.id
				);
				story1 = story;
				voiceNames = '';
				soundEffects = '';
				objectSounds = '';
				oSounds = [];
				fSounds = [];
				vSounds = [];
				story1.passages.forEach(p => {
					ptext = p.text;
					lines = ptext.split("\n");
					pre = '';
					lines.forEach(l =>{
						
						if (l.includes("$Effect") || l.includes("$Sound") ){
							var i = 0;
							while (i<10){
								l = l.replace("\t","");
								l = l.replace("  "," ");
								i = i +1;
							}
							words = l.split(" ");
							words.forEach(w => {
								w = w.replace("(","");
								w = w.replace(")","");
								if (w.includes("Sound") && !w.includes('$') && !w.includes("NAME")&& !vSounds.includes(w)){
									voiceNames = voiceNames + w + '\n';
									vSounds.push(w);
								}
								else if (w.includes("Effect") && !w.includes('$') && !w.includes("NAME")&& !fSounds.includes(w)){
									soundEffects = soundEffects + w + '\n';
									fSounds.push(w);
								}
								

							});	
						}
					
					});
				});
				story1.name = "Sounds";
				if (story1.passages.length < 4){
					toPush = story1.passages[0];
					story1.passages.push(toPush);
					story1.passages.push(toPush);
					story1.passages.push(toPush);
					story1.passages.push(toPush);
				}

				p0 = story1.passages[0];
				p1 = story1.passages[1];
				p2 = story1.passages[2];
				

				p0.name = "Voice Names";
				p0.text = voiceNames;
				p1.name = "Object Sounds";
				p1.text = objectSounds;
				p2.name = "Sound Effects";
				p2.text = soundEffects;

				story1.passages[0] = p0;
				story1.passages[1] = p1;
				story1.passages[2] = p2;
				

				k = 0;
				max = story1.passages.length;
				while (k<max){
					if (k > 2){
						story1.passages[k].name = '';
						story1.passages[k].text = '';
					}
					k = k + 1;
				}

				loadFormat(
					this.$store,
					state.pref.proofingFormat.name,
					state.pref.proofingFormat.version
				).then(format => {
					replaceUI(publishStoryWithFormat(
						state.appInfo,
						story1,
						format
					));
				});
			}
		}
	},

	'/stories/:id/lighting': {
		component: {
			ready() {
				const state = this.$store.state;
				const story = state.story.stories.find(
					story => story.id === this.$route.params.id
				);
				story1 = story;
				sceneLights = '';
				objectLights = '';
				sLights = [];
				oLights = [];
				story1.passages.forEach(p => {
					ptext = p.text;
					pname = p.name;
					ptags = p.tags;
					lines = ptext.split("\n");
					lines.forEach(l =>{
						if (ptags.includes("blue") && l.includes("$Lighting") ){
							var i = 0;
							while (i<10){
								l = l.replace("\t","");
								l = l.replace("  "," ");
								i = i +1;
							}
							words = l.split(" ");
							words.forEach(w => {
								w = w.replace("(","");
								w = w.replace(")","");
								if (w.includes("SceneLighting") && !w.includes("NAME")&& !sLights.includes(w)){
									sceneLights = sceneLights + w + '\n';
									sLights.push(w);
								}
								else if (w.includes("ObjectLighting") && !w.includes("NAME")&& !oLights.includes(w)){
									objectLights = objectLights + w + '\n';
									oLights.push(w);
								}
							});	
						}
					});
				});
				story1.name = "Lights";
				if (story1.passages.length < 2){
					toPush = story1.passages[0];
					story1.passages.push(toPush);
					story1.passages.push(toPush);
				}

				p0 = story1.passages[0];
				p1 = story1.passages[1];
				
				p0.name = "Scene Lighting";
				p0.text = sceneLights;
				p1.name = "Object Lighting";
				p1.text = objectLights;


				story1.passages[0] = p0;
				story1.passages[1] = p1;

				k = 0;
				max = story1.passages.length;
				while (k<max){
					if (k > 1){
						story1.passages[k].name = '';
						story1.passages[k].text = '';
					}
					k = k + 1;
				}

				loadFormat(
					this.$store,
					state.pref.proofingFormat.name,
					state.pref.proofingFormat.version
				).then(format => {
					replaceUI(publishStoryWithFormat(
						state.appInfo,
						story1,
						format
					));
				});
			}
		}
	},	

	'/stories/:id/models': {
		component: {
			ready() {
				const state = this.$store.state;
				const story = state.story.stories.find(
					story => story.id === this.$route.params.id
				);
				story1 = story;
				objectModels = '';
				faceModels = '';
				bodyModels = '';
				sceneModels = '';
				oModels = [];
				fModels = [];
				bModels = [];
				sModels = [];
				story1.passages.forEach(p => {
					ptext = p.text;
					lines = ptext.split("\n");
					pre = '';
					lines.forEach(l =>{
						if(l.includes('Scene:')){
							pre = 'Scene';
						}
						if(l.includes('Object')){
							pre = 'Object';
						}
						if(l.includes('Face')){
							pre = 'Face';
						}
						if(l.includes('Body')){
							pre = 'Body';
						}

						if (l.includes("$Model")){
							var i = 0;
							while (i<10){
								l = l.replace("\t","");
								l = l.replace("  "," ");
								i = i +1;
							}
							words = l.split(" ");
							words.forEach(w => {

								w = w.replace("(","");
								w = w.replace(")","");
								w = pre + w;
								if (w.includes("SceneModel") && !w.includes("NAME") && !sModels.includes(w)){
									sceneModels = sceneModels + w + '\n';
									sModels.push(w);
								}
								if (w.includes("ObjectModel") && !w.includes("NAME") && !oModels.includes(w)){
									objectModels = objectModels + w + '\n';
									oModels.push(w);
								}
								else if (w.includes("FaceModel") && !w.includes("NAME") && !fModels.includes(w)){
									faceModels = faceModels + w + '\n';
									fModels.push(w);
								}
								else if (w.includes("BodyModel") && !w.includes("NAME") && !bModels.includes(w)){
									bodyModels = bodyModels + w + '\n';
									bModels.push(w);
								}

							});	
						}
					
					});
				});
				story1.name = "Models";
				if (story1.passages.length < 4){
					toPush = story1.passages[0];
					story1.passages.push(toPush);
					story1.passages.push(toPush);
					story1.passages.push(toPush);
					story1.passages.push(toPush);
				}

				p0 = story1.passages[0];
				p1 = story1.passages[1];
				p2 = story1.passages[2];
				p3 = story1.passages[3];
				

				p0.name = "Object models";
				p0.text = objectModels;
				p1.name = "Face models";
				p1.text = faceModels;
				p2.name = "Body models";
				p2.text = bodyModels;
				p3.name = "Scene models";
				p3.text = sceneModels;
				story1.passages[0] = p0;
				story1.passages[1] = p1;
				story1.passages[2] = p2;

				k = 0;
				max = story1.passages.length;
				while (k<max){
					if (k > 3){
						story1.passages[k].name = '';
						story1.passages[k].text = '';
					}
					k = k + 1;
				}

				loadFormat(
					this.$store,
					state.pref.proofingFormat.name,
					state.pref.proofingFormat.version
				).then(format => {
					replaceUI(publishStoryWithFormat(
						state.appInfo,
						story1,
						format
					));
				});
			}
		}
	},

	'/stories/:id/test': {
		component: {
			ready() {
				const state = this.$store.state;
				const story = state.story.stories.find(
					story => story.id === this.$route.params.id
				);

				loadFormat(
					this.$store,
					story.storyFormat,
					story.storyFormatVersion
				).then(format => {
					replaceUI(publishStoryWithFormat(
						state.appInfo,
						story,
						format,
						['debug']
					));
				});
			}
		}
	},

	'/stories/:storyId/test/:passageId': {
		component: {
			ready() {
				const state = this.$store.state;
				const story = state.story.stories.find(
					story => story.id === this.$route.params.storyId
				);

				loadFormat(
					this.$store,
					story.storyFormat,
					story.storyFormatVersion
				).then(format => {
					replaceUI(publishStoryWithFormat(
						state.appInfo,
						story,
						format,
						['debug'],
						this.$route.params.passageId
					));
				});
			}
		}
	}
});

/* By default, show the story list. */

TwineRouter.redirect({
	'*': '/stories'
});

TwineRouter.beforeEach(transition => {
	/*
	If we are moving from an edit view to a list view, give the list view the
	story that we were previously editing, so that it can display a zooming
	transition back to the story.
	*/

	if (transition.from.path && transition.to.path === '/stories') {
		const editingId =
			transition.from.path.match('^/stories/([^\/]+)$');

		if (editingId) {
			transition.to.params.previouslyEditing = editingId[1];
		}
	}

	/*
	If the user has never used the app before, point them to the welcome view
	first. This has to come below any other logic, as calling transition.next()
	or redirect() will stop any other logic in the function.
	*/

	const welcomeSeen = store.state.pref.welcomeSeen;

	if (transition.to.path === '/welcome' || welcomeSeen) {
		transition.next();
	}
	else {
		transition.redirect('/welcome');
	}
});

module.exports = TwineRouter;
