// A Vuex module for working with stories. This is meant to be incorporated by
// index.js.

const uuid = require('tiny-uuid');
const locale = require('../../locale'); 
const ui = require('../../ui');
var stringy = 'General:\n- If using Safari switch to Chrome or Firefox\n- Comments should be preceded by a "#" sign.\n- Variable names should be preceded by a "$" sign. e.g. $UserName\n\n-----------------------------------------------------------------------\nAvatar Node:\n- Output variables are set by default to "_ID_", specify the model or animation by changing the field (including the underscores). \n- e.g. (set: $Avatar1FaceAnim to "Smiling")\n- if "_ID_" is left as is, then no animation will be applied.\n\n-----------------------------------------------------------------------\nLogic Node:\n- In the first line, specify N, the number of UserResponses\ne.g. UserOptions:3\n- Set $IsRandom to either true or false by changing the _value_ field\n- Set $IsConditional to either true or false by changing the _value_ field\n- If specific, specify probabilities between 0.0 and 1.0 for each child node in order, separated by commas:\ne.g. (set: $IsSpecific to {0.1,0.7,0.2})  \nmeaning UserResponse1 child node would occur 10% of the time.\n- If {} is left empty, the parser assumes the action is not specific.\n- Set $IsOpen to either true of false by changing the _value_ field\n$IsOpen should be set to true only if open conversation is to be executed regardless of input.\n\n- The fields under UserResponseN specify the conditions required for moving to its child node.\n- Change the "_value_" field to specify the condition. \ne.g. ($CamF is "Happy") implies the child node is visited if the front camera detects happy features.\n- If the condition is specifically negative, replace "is" with "is not"\ne.g. ($CamF is not "Happy")\n- "//" can be used to delineate multiple iterations for the $MicSpeech value\ne.g. ($MicSpeech is "No // No, I do not // I dont know about that")\n- If a parameter is not applicable, leave the field set to "_value_"\n\n- OpenConv\nOpenConv is executed if either $IsOpen has been set to true OR confidence level for the other user responses is below 0.9\n- $Duration specifies how long the open conversation should last, "_value_" can be changed to:\n	* specific number of exchanges. e.g. (set: $Duration to "5") \n	* random number of exchanges [1-10]. e.g. (set: $Duration to "random")\n	* low number of exchanges [1-3]. e.g. (set: $Duration to "low")\n	* high number of exchanges [7-10]. e.g. (set: $Duration to "high")\n	* medium number of exchanges [4-6]. e.g. (set: $Duration to "medium")\nstart: [[_NextNodeTitle_]] specifies the avatar node starting the open conversation\nend: [[_NextNodeTitle_]] specifies the avatar node ending the open conversation\n\n-----------------------------------------------------------------------\n\nUser Node:\n_ For clarity, copy and paste UserResponse conditions associated with each \nparticular User Node.';
var unistring = 'UserOptions:7\n\n(if: $MicSpeech is "{VALUE}")\n[ [[{NextNodeTitle}]] ]\n\n(if: $MicEnvironment is "{VALUE}")\n[ [[{NextNodeTitle}]] ]\n\n(if: $FCamRecognition is "{VALUE}")\n[ [[{NextNodeTitle}]] ]\n\n(if: $FCamObstruction is true)\n[ [[{NextNodeTitle}]] ]\n\n(if: $ScreenTap is true)\n[ [[{NextNodeTitle}]] ]\n\n(if: $ScreenZoom is true)\n[ [[{NextNodeTitle}]] ]\n\n(if: $PathHistory is true)\n[ [[{NextNodeTitle}]] ]';
var avatarTemplateText = 'SCREEN:\n\t(set: $Screen to "Screen_{NAME}")\n\t(set: $Experience to "Camera_{NAME}")\n\nSTAGE:\n\tScene:\n\t\t(set: $Model to "SceneModel_{NAME}")\n\t\t(set: $Anim to "SceneAnim_{NAME}")\n\t\t(set: $Lighting to "SceneLighting_{NAME}")\n\t\t(set: $Sound to "Sound_{NAME}")\n\t\t(set: $Effect to "SoundEffect_{NAME}")\n\t\t(set: $Duration to {N})\n\nOBJECTS(2):\n\tObject1:\n\t\t(set: $Model to "ObjectModel_{NAME}") \n\t\t(set: $Origin to ({X, Y, Z}))\n\t\t(set: $Anim to "ObjectAnim_{NAME}")\n\t\t(set: $Destination to ({X, Y, Z}))\n\t\t(set: $Duration to {N})\n\t\t(set: $Lighting to "ObjectLighting_{NAME}")\n\t\t(set: $Sound to "ObjectSound_{NAME}")\n\t\t(set: $Duration to {N})\n\n\tObject2:\n\t\t(set: $Model to "ObjectModel_{NAME}")\n\t\t(set: $Origin to ({X, Y, Z}))\n\t\t(set: $Anim to "ObjectAnim_{NAME}")\n\t\t(set: $Destination to ({X, Y, Z}))\n\t\t(set: $Duration to {N})\n\t\t(set: $Lighting to "ObjectLighting_{NAME}")\n\t\t(set: $Sound to "ObjectSound_{NAME}")  \n\t\t(set: $Duration to {N})  \n\nAVATARS:\n\n[[{NextNodeTitle}]]';
var logicTemplateText = 'UserOptions:{N}\n\t(set: $IsRandom to {VALUE})\n\t(set: $IsConditional to {VALUE})\n\t(set: $IsSpecific to [])\n\t(set: $IsOpen to {VALUE})\n\nUserResponse1:\n\t($MicSpeech is  "{VALUE}")\n\t($CamF is  "{VALUE}")\n\t($AnalysisBasic_{NAME} is  {VALUE})\n\t($AnalysisCustom_{NAME} is  {VALUE})\n\nUserResponse2:\n\t($MicSpeech is  "{VALUE}")\n\t($CamF is  "{VALUE}")\n\t($AnalysisBasic_{NAME} is  {VALUE})\n\t($AnalysisCustom_{NAME} is  {VALUE})\n\nOpenConv:\n\t(set: $Duration to  "{VALUE}")\n\tstart: [[{NextNodeTitle}]]\n\tend:   [[{NextNodeTitle}]]\n\n(if: $UserResponse1 is true)[ [[{NextNodeTitle}]] ]\n(if: $UserResponse2 is true)[ [[{NextNodeTitle}]] ]';
var userTemplateText = 'UserResponseN:\n\t($MicSpeech is "{VALUE}")\n\t($CamF is "{VALUE}")\n\t($AnalysisBasic_{NAME} is {VALUE})\n\t($AnalysisCustom_{NAME} is {VALUE})\n\n[[{NextNodeTitle}]]';
function getStoryById(state, id) {
	let story = state.stories.find(story => story.id === id);

	if (!story) {
		throw new Error(`No story exists with id ${id}`);
	}

	return story;
}

function getPassageInStory(story, id) {
	let passage = story.passages.find(passage => passage.id === id);
	
	if (!passage) {
		throw new Error(`No Node exists in this story with id ${id}`);
	}

	return passage;
}

const storyStore = module.exports = {
	state: {
		stories: []
	},

	mutations: {
		CREATE_STORY(state, props) {
			let story = Object.assign(
				{
					id: uuid(),
					lastUpdate: new Date(),
					ifid: uuid().toUpperCase(),
					tagColors: {},
					passages: []
				},
				storyStore.storyDefaults,
				props
			);

			if (story.passages) {
				story.passages.forEach(passage => passage.story = story.id);
			}
			state.stories.push(story);
		},

		UPDATE_STORY(state, id, props) {
			let story = getStoryById(state, id);

			Object.assign(story, props);
			story.lastUpdate = new Date();
		},

		DUPLICATE_STORY(state, id, newName) {
			const original = getStoryById(state, id);

			let story = Object.assign(
				{},
				original,
				{
					id: uuid(),
					ifid: uuid().toUpperCase(),
					name: newName
				}
			);

			/* We need to do a deep copy of the passages. */

			story.passages = [];

			original.passages.forEach(passage => {
				story.passages.push(Object.assign(
					{},
					passage,
					{
						id: uuid(),
						story: story.id
					}
				));

				if (passage.tags) {
					passage.tags = passage.tags.slice(0);
				}
			});

			state.stories.push(story);
		},

		IMPORT_STORY(state, toImport) {
			// See data/import.js for how the object that we receive is
			// structured.

			// Assign IDs to to everything, link passages to their story,
			// and set the story's startPassage property appropriately.

			toImport.id = uuid();
			toImport.passages.forEach(p => {
				p.id = uuid();
				p.story = toImport.id;

				if (p.pid === toImport.startPassagePid) {
					toImport.startPassage = p.id;
				}

				delete p.pid;
			});

			delete toImport.startPassagePid;
			state.stories.push(toImport);
		},

		DELETE_STORY(state, id) {

			state.stories = state.stories.filter(story => story.id !== id);
		},

		CREATE_PASSAGE_IN_STORY(state, storyId, props) {
			let story = getStoryById(state, storyId);
			let newPassage = Object.assign(
				{
					id: uuid()
				},
				storyStore.passageDefaults,
				props
			);


			/*
			Force the top and left properties to be at least zero, to keep
			passages onscreen.
			*/

			if (newPassage.left < 0) {
				newPassage.left = 0;
			}

			if (newPassage.top < 0) {
				newPassage.top = 0;
			}

			newPassage.story = story.id;
			newPassage.name = "Synopsis";
			newPassage.text = "\nCHARACTERS:\n\t[AvatarA, AvatarB]\n\nVOICES:\n\t\nSCENE:\n\t\nSCENARIO:\n\t";
			
			story.passages.push(newPassage);

			story.lastUpdate = new Date();
		},
		CREATE_PASSAGEZ_IN_STORY(state, storyId, props) {
			let story = getStoryById(state, storyId);
			let newPassage = Object.assign(
				{
					id: uuid()
				},
				storyStore.passageDefaults,
				props
			);


			/*
			Force the top and left properties to be at least zero, to keep
			passages onscreen.
			*/

			if (newPassage.left < 0) {
				newPassage.left = 0;
			}

			if (newPassage.top < 0) {
				newPassage.top = 0;
			}

			newPassage.story = story.id;
			story.passages.push(newPassage);

			if (story.passages.length === 1) {
				story.startPassage = newPassage.id;
			}

			story.lastUpdate = new Date();
		},
		CREATE_PASSAGESAME_IN_STORY(state, storyId, props) {
			let story = getStoryById(state, storyId);
			let newPassage = Object.assign(
				{
					id: uuid()
				},
				storyStore.passageDefaults,
				props
			);


			/*
			Force the top and left properties to be at least zero, to keep
			passages onscreen.
			*/

			if (newPassage.left < 0) {
				newPassage.left = 0;
			}

			if (newPassage.top < 0) {
				newPassage.top = 0;
			}

			newPassage.story = story.id;
			story.passages.push(newPassage);

			if (story.passages.length === 1) {
				story.startPassage = newPassage.id;
			}

			story.lastUpdate = new Date();
		},
		CREATE_PASSAGEX_IN_STORY(state, storyId, props) {
			let story = getStoryById(state, storyId);
			let newPassage = Object.assign(
				{
					id: uuid()
				},
				storyStore.passageXDefaults,
				props
			);


			/*
			Force the top and left properties to be at least zero, to keep
			passages onscreen.
			*/

			if (newPassage.left < 0) {
				newPassage.left = 0;
			}

			if (newPassage.top < 0) {
				newPassage.top = 0;
			}

			newPassage.story = story.id;
			story.passages.push(newPassage);

			if (story.passages.length === 1) {
				story.startPassage = newPassage.id;
			}

			story.lastUpdate = new Date();
		},
		CREATE_PASSAGEA_IN_STORY(state, storyId, props) {
			let story = getStoryById(state, storyId);
			let newPassage = Object.assign(
				{
					id: uuid()
				},
				storyStore.passageADefaults,
				props
			);
			console.log('@@@@@@@@@@@@@@@@@');
			console.log(storyStore.passageADefaults);
			console.log('@@@@@@@@@@@@@@@@@');
			console.log(props);
			console.log('@@@@@@@@@@@@@@@@@');
			/*
			Force the top and left properties to be at least zero, to keep
			passages onscreen.
			*/

			if (newPassage.left < 0) {
				newPassage.left = 0;
			}

			if (newPassage.top < 0) {
				newPassage.top = 0;
			}

			newPassage.story = story.id;
			

			var avatarBlock = '\n\tAvatar:\n\t\tVoice:\n\t\t\t"{INSERT DIALOGUE HERE}"\n\t\t\t(set: $Name to "VoiceName_{NAME}")\n\t\tSound:\n\t\t\t(set: $Effect to "SoundEffect_{NAME}")\n\t\tOpenAnim:\n\t\t\t(set: $Directive to "{NAME}")\n\t\t\t(set: $Duration to {N})\n\t\tFace:\n\t\t\t(set: $Model to "FaceModel_{NAME}")\n\t\t\t(set: $Anim to "FaceAnim_{NAME}")\n\t\t\t(set: $Axis to "FaceAxis_{NAME}")\n\t\t\t(set: $Duration to {N})\n\t\tBody:\n\t\t\t(set: $Model to "BodyModel_{NAME}")\n\t\t\t(set: $Origin to ({X, Y, Z}))\n\t\t\t(set: $Anim to "BodyAnim_{NAME}")\n\t\t\t(set: $Destination to ({X, Y, Z})) \n\t\t\t(set: $Duration to {N})\n\n';
			var objectBlock = '\n\tObject:\n\t\t(set: $Model to "ObjectModel_{NAME}") \n\t\t(set: $Origin to ({X, Y, Z}))\n\t\t(set: $Anim to "ObjectAnim_{NAME}")\n\t\t(set: $Destination to ({X, Y, Z}))\n\t\t(set: $Duration to {N})\n\t\t(set: $Lighting to "ObjectLighting_{NAME}")\n\t\t(set: $Sound to "ObjectSound_{NAME}")  \n\t\t(set: $Duration to {N})';
			var modified = newPassage.text;
			story.passages.forEach(p => {
    				if (p.name == "Synopsis"){
    					var synopsisText = p.text;
					var embeddedList = synopsisText.split("[");
					var names = embeddedList[1].split("]")[0];
					names = names.replace(" ", "");
					names = names.replace(" ", "");
					names = names.replace(" ", "");
					var newnames = names.split(",");
					var lenty = newnames.length; 
					var i = 0; 
					while (i<lenty){
						var currentName = newnames[i];
						newAvatarBlock = avatarBlock.replace("Avatar",currentName);
						modified = modified.replace("\n\n[[",newAvatarBlock + "\n\n[[");
						i = i + 1;
					}
				}



    			});


			var k = story.passages.length;

			while ( k != 0){
				last_p = story.passages[k-1];
				last_text = last_p.text;
				if (last_text.includes("OBJECTS(")){
					var juicy_bit = last_text.split("OBJECTS(");
                                        juicy_bit = juicy_bit[1].split(")");
                                        juicy_bit = juicy_bit[0];
                                        juicy_bit_int = parseInt(juicy_bit);
					var j =0;
                                        var toDelete = modified.split("OBJECTS(")[1];
                                        toDelete = toDelete.split("\n\nAVATARS:")[0];
                                        modified = modified.replace("\nOBJECTS(" + toDelete,"\nOBJECTS("+juicy_bit+"):");
					while(j<juicy_bit_int){
                                                var jj = j + 1;
                                                var j_str = jj.toString();
                                                newObjectBlock = objectBlock.replace("Object:","Object" + j_str+ ":");
                                      		modified = modified.replace("\n\nAVATARS:",newObjectBlock + "\n\nAVATARS:");
                                                j = j + 1;
                                        }
					k = 0;
				}
				else {
					k = k - 1;
				}
			}
			newPassage.text = modified;

			story.passages.push(newPassage);

			if (story.passages.length === 1) {
				story.startPassage = newPassage.id;
			}

			story.lastUpdate = new Date();
		},
		CREATE_PASSAGEU_IN_STORY(state, storyId, props) {
			let story = getStoryById(state, storyId);
			let newPassage = Object.assign(
				{
					id: uuid()
				},
				storyStore.passageUDefaults,
				props
			);


			/*
			Force the top and left properties to be at least zero, to keep
			passages onscreen.
			*/

			if (newPassage.left < 0) {
				newPassage.left = 0;
			}

			if (newPassage.top < 0) {
				newPassage.top = 0;
			}

			newPassage.story = story.id;
			story.passages.push(newPassage);

			if (story.passages.length === 1) {
				story.startPassage = newPassage.id;
			}

			story.lastUpdate = new Date();
		},
		CREATE_PASSAGEL_IN_STORY(state, storyId, props) {
			let story = getStoryById(state, storyId);
			let newPassage = Object.assign(
				{
					id: uuid()
				},
				storyStore.passageLDefaults,
				props
			);


			/*
			Force the top and left properties to be at least zero, to keep
			passages onscreen.
			*/

			if (newPassage.left < 0) {
				newPassage.left = 0;
			}

			if (newPassage.top < 0) {
				newPassage.top = 0;
			}

			newPassage.story = story.id;
			story.passages.push(newPassage);

			if (story.passages.length === 1) {
				story.startPassage = newPassage.id;
			}

			story.lastUpdate = new Date();
		},
		UPDATE_PASSAGE_IN_STORY(state, storyId, passageId, props) {
			let story = getStoryById(state, storyId);

			/*
			Force the top and left properties to be at least zero, to keep
			passages onscreen.
			*/

			if (props.left && props.left < 0) {
				props.left = 0;
			}

			if (props.top && props.top < 0) {
				props.top = 0;
			}

			Object.assign(getPassageInStory(story, passageId), props);
			story.lastUpdate = new Date();
		},
		UPDATE_PASSAGEU_IN_STORY(state, storyId, passageId, props) {
			let story = getStoryById(state, storyId);

			/*
			Force the top and left properties to be at least zero, to keep
			passages onscreen.
			*/

			if (props.left && props.left < 0) {
				props.left = 0;
			}

			if (props.top && props.top < 0) {
				props.top = 0;
			}

			Object.assign(getPassageInStory(story, passageId), props);
			story.lastUpdate = new Date();
		},
		UPDATE_PASSAGEX_IN_STORY(state, storyId, passageId, props) {
			let story = getStoryById(state, storyId);

			/*
			Force the top and left properties to be at least zero, to keep
			passages onscreen.
			*/

			if (props.left && props.left < 0) {
				props.left = 0;
			}

			if (props.top && props.top < 0) {
				props.top = 0;
			}

			Object.assign(getPassageInStory(story, passageId), props);
			story.lastUpdate = new Date();
		},

		UPDATE_PASSAGEX_IN_STORY(state, storyId, passageId, props) {
			let story = getStoryById(state, storyId);

			/*
			Force the top and left properties to be at least zero, to keep
			passages onscreen.
			*/

			if (props.left && props.left < 0) {
				props.left = 0;
			}

			if (props.top && props.top < 0) {
				props.top = 0;
			}

			Object.assign(getPassageInStory(story, passageId), props);
			story.lastUpdate = new Date();
		},
		UPDATE_PASSAGEA_IN_STORY(state, storyId, passageId, props) {
			let story = getStoryById(state, storyId);

			/*
			Force the top and left properties to be at least zero, to keep
			passages onscreen.
			*/

			if (props.left && props.left < 0) {
				props.left = 0;
			}

			if (props.top && props.top < 0) {
				props.top = 0;
			}

			Object.assign(getPassageInStory(story, passageId), props);
			story.lastUpdate = new Date();
		},
		UPDATE_PASSAGEL_IN_STORY(state, storyId, passageId, props) {
			let story = getStoryById(state, storyId);

			/*
			Force the top and left properties to be at least zero, to keep
			passages onscreen.
			*/

			if (props.left && props.left < 0) {
				props.left = 0;
			}

			if (props.top && props.top < 0) {
				props.top = 0;
			}

			Object.assign(getPassageInStory(story, passageId), props);
			story.lastUpdate = new Date();
		},
		DELETE_PASSAGE_IN_STORY(state, storyId, passageId) {
			let story = getStoryById(state, storyId);
			story.passages = story.passages.filter(passage => passage.selected == false);



		},	
		DELETE_PASSAGES_IN_STORY(state, storyId, passageIds){
			let story = getStoryById(state, storyId);

			story.passages =
				story.passages.filter(passage => passage.id == passageId);
			story.lastUpdate = new Date();

		}
	},

	// Defaults for newly-created objects.

	storyDefaults: {
		name: locale.say('Untitled Story'),
		startPassage: -1,
		zoom: 1,
		snapToGrid: false,
		stylesheet: '',
		script: '',
		storyFormat: '',
		storyFormatVersion: ''
	},

	passageDefaults: {
		story: -1,
		top: 0,
		left: 0,
		width: 100,
		height: 100,
		tags: ['gray'],
		name: locale.say('Synopsis'),
		selected: false,
		edited: false,
		saved: false,

		text: ui.hasPrimaryTouchUI() ?
			locale.say('Tap this node, then the pencil icon to edit it.')
			: locale.say(stringy)
	},
	passageXDefaults: {
		story: -1,
		top: 0,
		left: 0,
		width: 100,
		height: 100,
		tags: ['yellow'],
		name: locale.say('Universal'),
		selected: false,
		edited: false,
		saved: false,

		text: ui.hasPrimaryTouchUI() ?
			locale.say('Tap this node, then the pencil icon to edit it.')
			: locale.say(unistring)
	},

	passageADefaults: {
		story: -1,
		top: 0,
		left: 0,
		width: 100,
		height: 100,
		tags: ['blue'],
		name: locale.say('Avatar'),
		selected: false,
		edited: false,
		saved: false,

		text: ui.hasPrimaryTouchUI() ?
			locale.say('Tap this node, then the pencil icon to edit it.')
			: locale.say(avatarTemplateText)
	},
	passageUDefaults: {
		story: -1,
		top: 0,
		left: 0,
		width: 100,
		height: 100,
		tags: ['green'],
		name: locale.say('User'),
		selected: false,
		edited: false,
		saved: false,

		text: ui.hasPrimaryTouchUI() ?
			locale.say('Tap this node, then the pencil icon to edit it.')
			: locale.say(userTemplateText)
	},
	passageLDefaults: {
		story: -1,
		top: 0,
		left: 0,
		width: 100,
		height: 100,
		tags: ['red'],
		name: locale.say('Logic'),
		selected: false,
		edited: false,
		saved: false,

		text: ui.hasPrimaryTouchUI() ?
			locale.say('Tap this node, then the pencil icon to edit it.')
			: locale.say(logicTemplateText)
	}
};
