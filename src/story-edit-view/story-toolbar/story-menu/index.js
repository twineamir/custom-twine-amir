// A drop-down menu with miscellaneous editing options for a story.

const escape = require('lodash.escape');
const Vue = require('vue');
const FormatDialog = require('../../../dialogs/story-format');
const JavaScriptEditor = require('../../../editors/javascript');
const StatsDialog = require('../../../dialogs/story-stats');
const StylesheetEditor = require('../../../editors/stylesheet');
const { loadFormat } = require('../../../data/actions/story-format');
const locale = require('../../../locale');
const { prompt } = require('../../../dialogs/prompt');
const { publishStoryWithFormat } = require('../../../data/publish');
const save = require('../../../file/save');
const { selectPassages, deletePassages } = require('../../../data/actions/passage');
const { updateStory } = require('../../../data/actions/story');

//custom parsing 
function unityParser(storyData) {

	function spaceCleaner(toClean){
		cleaning = 0;
		while (cleaning < 100){
			toClean = toClean.replace("\n\n\n","\n\n");
			cleaning = cleaning + 1;
		}
		cleaning = 0;
		while (cleaning < 10){
			toClean = toClean.replace("\t\t\t\t\t","");
			cleaning = cleaning + 1;
		}
		cleaning = 0;
		while (cleaning < 100){
			toClean = toClean.replace("\t\t\t\t","");
			cleaning = cleaning + 1;
		}
		cleaning = 0;
		while (cleaning < 100){
			toClean = toClean.replace("\t\t\t","");
			cleaning = cleaning + 1;
		}
		cleaning = 0;
		while (cleaning < 100){
			toClean = toClean.replace("\t\t","");
			cleaning = cleaning + 1;
		}
		cleaning = 0;
		while (cleaning < 100){
			toClean = toClean.replace("\t","");
			cleaning = cleaning + 1;
		}
		cleaning = 0;
		while (cleaning < 100){
			toClean = toClean.replace("  "," ");
			cleaning = cleaning + 1;
		}
		return toClean;
	}

	function strCleaner(strr){
		strr = strr.replace('")','"');
		strr = strr.replace('("','"');
		//strr = strr.replace('$','');
		strr = strr.replace(" ","");
		strr = strr.replace(" ","");
		strr = strr.replace(" ","");
		strr = strr.replace(" ","");
		strr = strr.replace(" ","");
		strr = strr.replace(" ","");
		strr = strr.replace(" ","");
		strr = strr.replace(" ","");
		strr = strr.replace("\t","");
		strr = strr.replace("\t","");
		strr = strr.replace("\t","");
		strr = strr.replace("\t","");
		strr = strr.replace("\t\t","");
		strr = strr.replace("\t\t\t","");
		strr = strr.replace('$','');
		//strr = strr.charAt(0).toLowerCase() + strr.slice(1);
		return strr;
	}

	function intCleaner(strr){
		strr = strr.replace('"','');
		strr = strr.replace('"','');
		strr = strr.replace('"','');
		strr = strr.replace('"','');
		strr = strr.replace('(','');
		strr = strr.replace('$','');
		strr = strr.replace(')','');
		strr = strr.replace('{','');
		strr = strr.replace('}','');
		return strr;
	}

	function lineReader(strr){

		//distance punctuation...
		i = 0;
		ch = strr.slice(-1);
		
		strr = strr.replace("!"," ! ");
		strr = strr.replace("?"," ? ");
		strr = strr.replace(","," , ");
		strr = strr.replace(";"," ; ");
		strr = strr.replace(")"," ) ");
		strr = strr.replace("("," ( ");
		strr = strr.replace("."," . ");
		strr = strr.replace('"',' " ');
		strr = strr.replace('"',' " ');
	
		vars = [];
		words = strr.split(" ");
		words.forEach(w=>{
			if(w.includes('$')){
				if (w == words[words.length -1]){
					w = w.replace("$","");
					strr = strr.replace(w,'" +' + w.replace('"',''));
				}else if (w == words[0]){
					w = w.replace("$","");
					strr = strr.replace(w,w.replace('"','') + ' + "');
				}
				else{
					w = w.replace("$","");
					strr = strr.replace(w,'" + ' + w + ' + "');
				}
			}
		});

		return strr;
	}

	/*
	function declareVars(storyData){
		nodes = storyData.passages;
		fullText = '';
		nodes.forEach(node=>{
			fullText = fullText + node.text;
		});
		fullText = spaceCleaner(fullText);
		stopWords = ['.',')','(',',',';','!','?','"','[',']'];
		i = 0;
		while(i<10){
			i = i + 1;
			stopWords.forEach(sw=>{
				fullText = fullText.replace(sw,' ');
			});
		}
		fullText = spaceCleaner(fullText);
		words = fullText.split(" ");
		vars = [];
		words.forEach(w=>{
			if (!vars.includes(w)){
				vars.push(w);
			}
		});
		return declarations;
	}
	*/


	myPassages = storyData.passages;

	myPassages.forEach(p=>{
		if( p.name == "Synopsis"){
			lines = p.text.split('\n');
			lines.forEach(l=>{
				if (l.includes('[') && l.includes(']')){
					avatarNames = l.split('[')[1].split(']')[0];
					i = 0;
					while(i<10){
						avatarNames = avatarNames.replace(' ','');
						i = i +1;
					}
					avatarNames = avatarNames.split(',');
					
				}
			});
		}
	});

	//get avatar names and replace them
	myPassages.forEach(p=>{
		nodeName = p.name;
		nodeText = p.text;
		if (nodeName == "Synopsis"){
			
			lines = nodeText.split("\n");
			lines.forEach(l=>{
				if (l.includes("[") && l.includes("]")){
					l = l.split(']')[0].split('[')[1];
					i = 0;
					while (i<20){
						l = l.replace(' ','');
						i = i + 1;
					}
					avatarNames = l.split(',');
					//console.log(avatarNames);
				}
			});
		}
	});

	namesLen = avatarNames.length;
	newNames = [];
	i = 1;
	while (i<= namesLen){
		newNames.push('avatar' + i.toString());
		i= i +1;
	}
	//console.log(newNames);
	nl = "\n";
	tab = "\t";
	space = " ";
	result = "";


	

	yellowPassage = "";
	outputting = []; //list of all animation outputs
	myPassages.forEach( p => {

		foundStartingNode = false;
		if(p.id == storyData.startPassage){
			foundStartingNode = true;
		}
		

		newPassage = '';
		nodeName = p.name;
		nodeText = spaceCleaner(p.text);

		//replace {NextNodeTitle} with NONE
		i = 0;
		while(i<10){
			nodeText = nodeText.replace('{NextNodeTitle}','NONE');
			i = i + 1;
		}

		nodeTag = p.tags;
		logicNodeCounter = 0;
		
		if (p.tags == 'yellow'){
			isFirst = true;
			lines = nodeText.split(nl);
			lines.forEach(l=>{
				if (l.includes('(if:') && isFirst){
					isFirst = false;
					if (l.includes('"{VALUE}"')){
						l = l.replace('"{VALUE}"', '"DIDNOTSPECIFY"');
					}
					l = l.replace('(if:', 'if(');
					l = l.replace(' is not ', ' != ');
					l = l.replace(' is ', ' == ');
					l = l.replace(')',' && !isBranching )');
					words = l.split(' ');
					if (l.includes('Environment') || l.includes('Recognition') || l.includes('Speech')){
						l = l.replace(words[1],'$' + words[1].charAt(1).toLowerCase() + words[1].slice(2));
					}else{
						l = l.replace(words[1],'$' + words[1].charAt(1).toLowerCase() + words[1].slice(2)+ 'Flag');
					}
					
					//console.log(words[1]);
					newLine = l + '{' + nl;
					newPassage = newPassage + newLine;
				}


				if(l.includes('(if:')){
					isFirst = false;
					if (l.includes('"{VALUE}"')){
						l = l.replace('"{VALUE}"', '"DIDNOTSPECIFY"');
					}
					l = l.replace('(if:', 'else if(');
					l = l.replace(' is not ', ' != ');
					l = l.replace(' is ', ' == ');
					l = l.replace(')',' && !$isBranching )');
					words = l.split(' ');
					if (l.includes('Environment') || l.includes('Recognition') || l.includes('Speech')){
						l = l.replace(words[2],'$' + words[2].charAt(1).toLowerCase() + words[2].slice(2));
					}else{
						l = l.replace(words[2],'$' + words[2].charAt(1).toLowerCase() + words[2].slice(2)+ 'Flag');
					}
					

					//l = l.replace(words[2],'$' + words[2].charAt(1).toLowerCase() + words[2].slice(2)+ 'Flag');
					//console.log(words[3]);
					//console.log(words[4]);
					newLine = l + '{' + nl;
					newPassage = newPassage + newLine;
				}

				if (l.includes('[ [[')){
					l = l.split("[[")[1].split("]]")[0];
					newLine = '$recallNode = $currentNode ;' + nl
					newLine = newLine + '$currentNode = "' + l + '" ;' + nl + '$isAnimationNode = false;' + nl + '$isBranching = true;' + nl + '}' + nl;
					newPassage = newPassage + newLine;
				}

			})
			yellowPassage = newPassage;
		}

		if (p.tags == 'red'){
			logicNodeCounter = logicNodeCounter + 1;
			lines = nodeText.split("\n");
			breakers = [];
			links = [];
			probs = [];
			noNeed = false; //indicates if we need to parse specific case
			lines.forEach(l=>{
				if (l.includes("$IsOpen")){
					if (l.includes("true")){
						newPassage = newPassage + '$isOpen = true;' + nl;
					}
					if (l.includes("false")||l.includes('{VALUE}')){
						newPassage = newPassage + '$isOpen = false;' + nl;
					}
				}
				if (l.includes("$IsConditional")){
					if (l.includes("true")){
						newPassage = newPassage + '$isConditional = true;' + nl;
					}
					if (l.includes("false")||l.includes('{VALUE}')){
						newPassage = newPassage + '$isConditional = false;' + nl;
					}
				}
				if (l.includes("$IsRandom")){
					if (l.includes("true")){
						newPassage = newPassage + '$isRandom = true;' + nl;
					}
					if (l.includes("false")||l.includes('{VALUE}')){
						newPassage = newPassage + '$isRandom = false;' + nl;
					}
				}
				if (l.includes("$IsSpecific")){
					if(l.includes('[]')){
						newPassage = newPassage + '$isSpecific = false;' + nl;
						noNeed = true;
					}else{
						noNeed = false;
						newPassage = newPassage + '$isSpecific = true;' + nl;
						theMeat = l.split('[')[1];
						theMeat = theMeat.split(']')[0];
						theMeat = strCleaner(theMeat);
						probs = theMeat.split(",");
						newProbs = [];
						probs.forEach(pb=>{
							newProbs.push(pb.split('.')[1].charAt(0));
						});
						probs = newProbs;
					}
				}
				else if (l.includes("[[") && l.includes("UserResponse")){
					link = l.split("[[")[1];
					link = link.split("]]")[0];
					link = '"' + link + '"';
					//console.log(link);
					links.push(link);
				}
				else if (l.includes("UserResponse")&& l.includes(":")){
					breakers.push(l);
				}else if(l.includes("OpenConv:")){
					breakers.push(l);
				}
			});
			toBreak = nodeText;
			blocks = [];
			breakers = breakers.reverse();
			breakers.forEach(b=>{
				broken = toBreak.split(b);
				if (broken[1] != null && broken[1].includes("$")){
					blocks.push(broken[1]);
				}
				toBreak = broken[0];
				
			});
			numOfResponses = blocks.length - 1;
			responseCounter = 0;
			blocks = blocks.reverse();
			openConv = blocks.pop();
			blocks.forEach(b=>{
				responseCounter = responseCounter + 1;
				conditions = [];
				lines = b.split(nl);
				lines.forEach(l=>{
					words = l.split(space);
					if (words[0].includes("$")){
						words[0] = words[0].replace("$","");
						words[0] = words[0].replace('(','');
						words[0] =  words[0].charAt(0).toLowerCase() + words[0].slice(1);
						console.log(words[0]);
						if (words[2].includes("{VALUE}") || words[0].includes('{NAME}')){
							words[0] = words[0].replace('{NAME}','');
							words[0] = words[0].replace("(","");
							words[0] = words[0].charAt(0).toLowerCase() + words[0].slice(1);
				
							newLine = '$' + words[0].replace("(","") + "Flag" + responseCounter.toString() + ' = true;';
							conditions.push(words[0].replace("(","") + "Flag" + responseCounter.toString());
							newPassage = newPassage + newLine + nl;
						} else if (words[0].includes("micSpeech")){
							if (l.includes('{VALUE}')){
								newPassage = newPassage + 'micSpeech = "";' + nl;
							}else{
								newPassage = newPassage + '$islisteningNode = true;' + nl;
								sentences = l.split('"')[1];
								sentences = sentences.split("//");
								populating = 'sentences.Clear();' + nl + 'sentences.Add( $micSpeech );' + nl;
								sentences.forEach(s=>{
									populating = populating + 'sentences.Add("' + s + '");' + nl;
								});
								words[0] = words[0].replace("(","");
								words[0] = words[0].charAt(0).toLowerCase() + words[0].slice(1);
								newLine = 'if( CompareMeaning(sentences) == true ){' + nl + '$' + words[0].replace("(","") + "Flag" + responseCounter.toString() + ' = true;' + nl + '}';
								newLine = newLine + 'else{ ' + nl + '$notSure = true;' + nl + '}';
								conditions.push('$' + words[0].replace("(","") + "Flag" + responseCounter.toString());
								newPassage = newPassage + populating + newLine + nl;
							}
						} 
						else {
							words[0] = words[0].replace("(","");
							words[0] = words[0].charAt(0).toLowerCase() + words[0].slice(1);
							newLine = 'if( ' + '$' + words[0] + ' == ' + words[2].replace(")","") + ' ){' + nl + '$' + words[0].replace("(","") + "Flag" + responseCounter.toString() + ' = true;' + nl + '}';
							conditions.push('$' + words[0] + "Flag" + responseCounter.toString());
							newPassage = newPassage + newLine + nl;
						}
					}
				})
				combined = '';
				conditions.forEach(c=>{
					combined = combined + c + ' && ';
				});
				if (combined.includes(' && ')){
					combined = combined + '%*%';
				}
				combined = combined.replace(" && %*%","");
				newLine = 'if( ' + combined + ' ){'+ nl+'$userResponse' + responseCounter.toString() + ' = true;' + nl + '}'
				newPassage = newPassage + newLine + nl;

			

			});

			//Adds random case
			randomBlock = '';
			populateRandom = '';
			populateRandom = 'string[] options' + logicNodeCounter.toString() + ' = ' + 'new string['+ links.length.toString() + '];' +nl;
			i = 0;
			links.forEach(lk=>{
				populateRandom = populateRandom + 'options' + logicNodeCounter.toString() + '[' + i.toString() + ']' +' = ' + lk + ';' + nl;
				i = i + 1;
			});
			populateRandom = populateRandom + '$currentNode = options' + logicNodeCounter.toString() + '[Random.Range(0,options'+logicNodeCounter.toString()+'.Length)];' + nl;
			randomBlock = 'if( $isRandom == true ){ ' + nl + populateRandom + '}';
			newPassage = newPassage + randomBlock + nl;

			//Adds Specific Prob case
			if (noNeed == false){
				populateSpecific = '';
				specificBlock = '';
				populateSpecific = 'string[] specificOptions' + logicNodeCounter.toString() + ' = ' + 'new string[10];' + nl;
				populateSpecific = populateSpecific + 'int index' + logicNodeCounter.toString() + ' = 0;' + nl;
				i = 0;
				links.forEach(lk=>{
					i = i + 1;
					populateSpecific = populateSpecific + 'int prob' + logicNodeCounter.toString() + '_' + i.toString() + ' = ' + probs[i-1] + ';' + nl;
					populateSpecific = populateSpecific + 'int counter' + logicNodeCounter.toString() + '_' + i.toString() + ' = 0;' + nl;
					populateSpecific = populateSpecific + 'while( counter' + logicNodeCounter.toString() + '_' + i.toString() + '<' + 'prob'+ logicNodeCounter.toString() + '_' + i.toString() + ' ){' + nl;
					populateSpecific = populateSpecific + 'specificOptions' + logicNodeCounter.toString() + '[index'+ logicNodeCounter.toString() + ']' + ' = ' + lk + ';' + nl;
					populateSpecific = populateSpecific + 'counter' + logicNodeCounter.toString() + '_' + i.toString() + '++;' + nl;
					populateSpecific = populateSpecific + 'index' + logicNodeCounter.toString() + '++;'+nl;
					populateSpecific = populateSpecific + '}' + nl;  
				});
				specificBlock = 'if( $isSpecific == true){ ' + nl + populateSpecific + nl + '$currentNode = specificOptions'+logicNodeCounter.toString()+'[Random.Range(0, specificOptions'+ logicNodeCounter.toString() +'.Length)];'  + nl + '}';
				newPassage = newPassage + specificBlock + nl;
			}

			//adds conditional block
			conditionalBlock = '';
			populateConditional = '';
			i = 0
			links.forEach(lk=>{
				i = i + 1;
				populateConditional = populateConditional + 'if( $isConditional && $userResponse' + i.toString()  + ' ){'+ nl;
				populateConditional = populateConditional + '$currentNode = ' + lk + ' ;' + nl + '}' + nl;
			});
			newPassage = newPassage + populateConditional;

			//adds automatic $isOpen evaluation
			newPassage = newPassage + '//OpenConv acts as default option' + nl + 'if( !isRandom && !$isSpecific && !$isConditional ){' + nl + '$isOpen = true;'+nl+'}'+nl;
			
			//parses OpenConv
			openConvBlock = '';
			
			lines = openConv.split(nl);
			lines.forEach(l=>{
				if (l.includes('[[') && l.includes("start")){
					link = l.split('[[')[1];
					link = '"' + link.split(']]')[0] + '"';
					openConvBlock = openConvBlock + '$openConvStartingNode = '+link+' ;'+nl;
				}
				if (l.includes('[[') && l.includes("end")){
					link = l.split('[[')[1];
					link = '"' + link.split(']]')[0] + '"';
					openConvBlock = openConvBlock + '$openConvReturningNode = '+link+';'+nl;
				}
				if (l.includes('$Duration')){
					words = l.split(space);
					if (l.includes('{VALUE}')){
						openConvBlock = openConvBlock + '$openConvDuration = 5;' + nl;

					}
					else if (l.includes('random')){
						openConvBlock = openConvBlock + 'int any = Random.Range(1,10);' + nl;
						openConvBlock = openConvBlock + '$openConvDuration = any;' + nl;
					} else if (l.includes('high')){
						openConvBlock = openConvBlock + 'int high = Random.Range(7,10);' + nl;
						openConvBlock = openConvBlock + '$openConvDuration = high;' + nl;
					} else if(l.includes('low')){
						openConvBlock = openConvBlock + 'int low =  Random.Range(1,3);' + nl;
						openConvBlock = openConvBlock + '$openConvDuration = low;' + nl;
					} else {
						openConvBlock = openConvBlock + '$openConvDuration = '+ intCleaner(words[3]) +';' +nl;
					}
				}
			});
			newPassage = newPassage + 'if( $isOpen == true ){'+ nl + openConvBlock + '}' + nl;
			pIntro = 'else if( $currentNode == "' + nodeName + '" ){' + nl;
			pOutro = '$isAnimationNode = false;' + nl + '}';
			newPassage = pIntro + newPassage + pOutro;
			result = result + newPassage + nl;
		}
		
		if (nodeTag == 'blue'){
			screen = '';
			stage = '';
			objects = '';
			avatars = '';
			link =  '';
			lines = nodeText.split('\n');
			lines.forEach(l=>{
				if (l.includes("[[")){
					link = l.split("[[")[1];
					link = link.split("]]")[0];
					link = '"'+link + '"';
					console.log(link);
				}
			});

			//chop animation node text...
			if (nodeText.includes("[[")){
				link = nodeText.split("[[")[1].replace("]]",'');
				avatars = nodeText.split("[[")[0].split("AVATARS:")[1];
				objects = nodeText.split("[[")[0].split("AVATARS:")[0].split("OBJECTS")[1];
				stage = nodeText.split("[[")[0].split("AVATARS:")[0].split("OBJECTS")[0].split("STAGE:")[1];
				screen = nodeText.split("[[")[0].split("AVATARS:")[0].split("OBJECTS")[0].split("STAGE:")[0].split("SCREEN:")[1];

			}else{
				avatars = nodeText.split("AVATARS:")[1];
				objects = nodeText.split("AVATARS:")[0].split("OBJECTS")[1];
				stage = nodeText.split("AVATARS:")[0].split("OBJECTS")[0].split("STAGE:")[1];
				screen = nodeText.split("AVATARS:")[0].split("OBJECTS")[0].split("STAGE:")[0].split("SCREEN:")[1];
			}
			
			//SCREEN:
			newPassage = newPassage + '//SCREEN:' + nl;
			lines = screen.split(nl);
			lines.forEach(l => { 
				words = l.split(space);
				if(words.length>3 && words[3].includes("{NAME}")){
					words[3] = '"NONE"';
				}
				if (l.includes("(set:")){
					if (words[1].includes("Duration")){
						if (words[3].includes("{N}")){
							words[3] = "0";
							newLine = '$' + strCleaner(words[1]).toLowerCase() + " = " + words[3] + ';';
							tokens = newLine.split(" ");
							tokens.forEach(t=>{
								if (t.includes('$') && !outputting.includes(t)){
									outputting.push(t);
								}
							});
							newPassage = newPassage + newLine + nl;
						}else{
							words[3] = intCleaner(words[3]);
							newLine ='$' +  strCleaner(words[1]).toLowerCase() + " = " + words[3] + ';';
							tokens = newLine.split(" ");
							tokens.forEach(t=>{
								if (t.includes('$') && !outputting.includes(t)){
									outputting.push(t);
								}
							});
							newPassage = newPassage + newLine + nl;
						}
						
					}else if(words[1].includes("Origin") || words[1].includes("Destination")){
						value = l.split(" to ")[1];
						value = strCleaner(value);
						if (value.includes("X,Y,Z")){
							value = 'NONE';
						}
						newLine = '$' + strCleaner(words[1]).toLowerCase() + " = " + value.replace(')','') + ';';
						tokens = newLine.split(" ");
							tokens.forEach(t=>{
								if (t.includes('$') && !outputting.includes(t)){
									outputting.push(t);
								}
							});
						newPassage = newPassage + newLine + nl;
					}
					
					else{
						newLine = '$' + strCleaner(words[1]).toLowerCase() + " = " + strCleaner(words[3]) + ';';
						tokens = newLine.split(" ");
							tokens.forEach(t=>{
								if (t.includes('$') && !outputting.includes(t)){
									outputting.push(t);
								}
							});
						newPassage = newPassage + newLine + nl;
					}
				}
			});
			
			//STAGE:
			newPassage = newPassage + '//STAGE:' + nl;
			scene = stage.split("Scene:")[1];
			//Scene:
			newPassage = newPassage + '//Scene:' + nl;
			sName = "scene";
			lines = scene.split(nl);
			lines.forEach(l => { 
				words = l.split(space);
				if(words.length>3 && words[3].includes("{NAME}")){
					words[3] = '"NONE"';
				}
				if (l.includes("(set:")){
					if (words[1].includes("Duration")){
						if (words[3].includes("{N}")){
							words[3] = "0";
							newLine = '$' + strCleaner(words[1]).toLowerCase() + " = " + words[3] + ';';
							tokens = newLine.split(" ");
							tokens.forEach(t=>{
								if (t.includes('$') && !outputting.includes(t)){
									outputting.push(t);
								}
							});
							newPassage = newPassage + newLine + nl;
						}else{
							words[3] = intCleaner(words[3]);
							newLine = '$' + strCleaner(words[1]).toLowerCase() + " = " + words[3] + ';';
							tokens = newLine.split(" ");
							tokens.forEach(t=>{
								if (t.includes('$') && !outputting.includes(t)){
									outputting.push(t);
								}
							});
							newPassage = newPassage + newLine + nl;
						}
					}else if(words[1].includes("Origin") || words[1].includes("Destination")){
						value = l.split(" to ")[1];
						value = strCleaner(value);
						if (value.includes("X,Y,Z")){
							value = 'NONE';
						}
						newLine = '$' + sName + strCleaner(words[1]) + ' = "' + value.replace(')','') + '";';
						tokens = newLine.split(" ");
							tokens.forEach(t=>{
								if (t.includes('$') && !outputting.includes(t)){
									outputting.push(t);
								}
							});
						newPassage = newPassage + newLine + nl;
					}else{
						newLine = '$' + sName + strCleaner(words[1]) + " = " + strCleaner(words[3]) + ';';
						tokens = newLine.split(" ");
							tokens.forEach(t=>{
								if (t.includes('$') && !outputting.includes(t)){
									outputting.push(t);
								}
							});
						newPassage = newPassage + newLine + nl;
					}
					
				}
			});

			//OBJECTS:
			buggy = '';
			
			lines = objects.split(nl);
			buggy = buggy + lines[0] + "//1" + lines[1] + '//2' + lines[2] + nl;

			lines[0] = '';
			objects = '';
			i = 1;
			while(i<lines.length){
				objects = objects + lines[i] + nl;
				i = i + 1;
			}
			objects = objects.split("\n\n");

			objects.forEach(o=>{
				lines = o.split(nl);
				oName = lines[0].replace(":","");
				//console.log(oName);
				oName = oName.replace(" ","");
				oName = oName.toLowerCase();
				oDurName = 'Anim';
				newPassage = newPassage + "//" + oName + nl;
				lines.forEach(l=>{
					words = l.split(space);
					if (l.includes("$Sound ")){
						oDurName = 'Sound';
					}
					if(words.length>3 && words[3].includes("{NAME}")){
						words[3] = '"NONE"';;
					}
					if (l.includes("(set:")){
						if (words[1].includes("Duration")){
							if (words[3].includes("{N}")){
								words[3] = "0";
								newLine =  '$' + oName + oDurName + strCleaner(words[1]) + " = " + words[3] + ';';
								tokens = newLine.split(" ");
								tokens.forEach(t=>{
									if (t.includes('$') && !outputting.includes(t)){
										outputting.push(t);
									}
								});
								newPassage = newPassage + newLine + nl;
							}else{
								words[3] = intCleaner(words[3]);
								newLine = '$' + oName + oDurName + strCleaner(words[1]) + " = " + words[3] + ';';
								tokens = newLine.split(" ");
								tokens.forEach(t=>{
									if (t.includes('$') && !outputting.includes(t)){
										outputting.push(t);
									}
								});
								newPassage = newPassage + newLine + nl;
							}
							
						}else if(words[1].includes("Origin") || words[1].includes("Destination")){
							value = l.split(" to ")[1];
							value = strCleaner(value);
							if (value.includes("X,Y,Z")){
								value = 'NONE';
							}
							newLine = '$' + oName + strCleaner(words[1]) + ' = "' + value.replace(')','') + '";';
							tokens = newLine.split(" ");
							tokens.forEach(t=>{
								if (t.includes('$') && !outputting.includes(t)){
									outputting.push(t);
								}
							});
							newPassage = newPassage + newLine + nl;
						}else{
							newLine = '$' + oName + strCleaner(words[1]) + " = " + strCleaner(words[3]) + ';';
							tokens = newLine.split(" ");
							tokens.forEach(t=>{
								if (t.includes('$') && !outputting.includes(t)){
									outputting.push(t);
								}
							});
							newPassage = newPassage + newLine + nl;
						}
					}
				});
			});
			
			//AVATARS:
			lines = avatars.split(nl);
			avatars = '';
			i = 1;
			while(i<lines.length){
				avatars = avatars + lines[i] + nl;
				i = i + 1;
			}

			avatarBlocks = [];
			avatarNames = avatarNames.reverse();
			avatarNames.forEach(xn=>{
				//console.log(xn);
				avatarBlocks.push(avatars.split(xn)[1]);
				avatars = avatars.split(xn)[0];
			});
			avatars = avatarBlocks.reverse();

			//console.log(avatars);
			aCounter = 1;
			avatars.forEach(a=>{
				//console.log(a);
				lines=[];
				if (a != null){
					lines = a.split(nl);
					aName = lines[0].replace(":","");
					aName = aName.replace(" ","");
					aName = 'avatar' + aCounter.toString();
					aCounter = aCounter + 1;

					newPassage = newPassage + "//" + aName + nl;
					here = false;
				}
				
				
				lines.forEach(l=>{
					if (here == true){
						if (l.includes('{INSERT DIALOGUE HERE}')){
							l = '"NONE"';
						}else if(l.includes("$")){
							l = lineReader(l);
						}
						newLine = '$' + aaName.replace('Voice','') + 'NextLine' + ' = ' + l + ';';
						tokens = newLine.split(" ");
							tokens.forEach(t=>{
								if (t.includes('$') && !outputting.includes(t)){
									outputting.push(t);
								}
							});
						newPassage = newPassage + newLine + nl;
						here = false;
					}
					if (l.includes("Voice:")){
						aaName = aName + "Voice";
						here = true;
					}
					if (l.includes("Face:")){
						aaName = aName + "Face";
					}
					if (l.includes("Sound:")){
						aaName = aName + "Sound";
					}
					if (l.includes("OpenAnim:")){
						aaName = aName + "OpenAnim";
					}
					if (l.includes("Body:")){
						aaName = aName + "Body";
					}
					words = l.split(space);
					if(words.length>3 && words[3].includes("{NAME}")){
						words[3] = '"NONE"';;
					}
					if (l.includes("(set:")){
						if (words[1].includes("Duration")){
							if (words[3].includes("{N}")){
								words[3] = "0";
								newLine = '$' + aaName + strCleaner(words[1]) + " = " + words[3] + ';';
								tokens = newLine.split(" ");
								tokens.forEach(t=>{
									if (t.includes('$') && !outputting.includes(t)){
										outputting.push(t);
									}
								});
								newPassage = newPassage + newLine + nl;
							}else{
								words[3] = intCleaner(words[3]);
								newLine = '$' + aaName + strCleaner(words[1]) + " = " + words[3] + ';';
								tokens = newLine.split(" ");
								tokens.forEach(t=>{
									if (t.includes('$') && !outputting.includes(t)){
										outputting.push(t);
									}
								});
								newPassage = newPassage + newLine + nl;
							}
							
						}else if(words[1].includes("Origin") || words[1].includes("Destination")){
							value = l.split(" to ")[1];
							value = strCleaner(value) ;
							if (value.includes("X,Y,Z")){
								value = 'NONE';
							}
							newLine = '$' +  aaName + strCleaner(words[1]) + ' = "' + value.replace(')','') + '";';
							tokens = newLine.split(" ");
							tokens.forEach(t=>{
								if (t.includes('$') && !outputting.includes(t)){
									outputting.push(t);
								}
							});
							newPassage = newPassage + newLine + nl;
						}else{
							newLine = '$' + aaName + strCleaner(words[1]) + " = " + strCleaner(words[3]) + ';';
							tokens = newLine.split(" ");
							tokens.forEach(t=>{
								if (t.includes('$') && !outputting.includes(t)){
									outputting.push(t);
								}
							});
							newPassage = newPassage + newLine + nl;
						}
					}
				});
			});
			newPassage = spaceCleaner(newPassage);
			if (foundStartingNode == true){
				pIntro = 'else if( $currentNode == "START" ){' + nl;
			}else{
				pIntro = 'else if( $currentNode == "' + nodeName + '" ){' + nl;
			}

			if (nodeText.includes("GOBACK")){
				pOutro =  '$isGoingBack = true;' + nl + '$isAnimationNode = true;' + nl + '}';
			}else{
				pOutro =  '$nextNode = "' + link + '";' + nl + '$isAnimationNode = true;' + nl + '}';
			}
			newPassage = pIntro + newPassage + pOutro;
			result = result + newPassage + nl;

		}
		
		if (p.tags == 'green'){
			lines = nodeText.split('\n');
			link = '';
			lines.forEach(l=>{
				if (l.includes("[[")){
					link = l.split("[[")[1];
					link = link.split("]]")[0];
					link = '"'+link + '"';
				}
			});
			newPassage = 'else if( $currentNode == "' + nodeName + '" ){' +  nl;
			
			newPassage = newPassage + '$currentNode = ' + link + ';' + nl + '$isAnimationNode = false;' + nl + '}';

			result = result + newPassage + nl;
		}
	
		
	});

	closingPassage = 'else{' + nl + '$nextNode = "ENDOFSTORY";' + nl + 'isAnimationNode = true;' + nl +'}';
	//GOBACK CASE
	gobackStr = 'else if( $isGoingBack == true ){'+ nl + 'isGoingBack = false;' + nl + '$currentNode = $recallNode ;' + nl + '$isAnimationNode = false;' +  nl + '}' + nl; 
	result = yellowPassage + gobackStr + result + closingPassage;


	resultCopy = result;
	i = 0;
	while (i<10000){
		resultCopy =resultCopy.replace('$','DOLLARHOOK');
		i = i + 1;
	}
	i = 0;
	while (i<10000){
		resultCopy =resultCopy.replace('DOLLARHOOK',' $');
		i = i + 1;
	}
	

	resultCopy = spaceCleaner(resultCopy);
	words = resultCopy.split(" ");
	hasDollarSign = []
	words.forEach(w=>{
		if (w.includes("$") && !hasDollarSign.includes(w)){
			hasDollarSign.push(w);
		}
		if (w.includes('Flag')){
			console.log(w);
		}
	});

	i = 0;
	while (i<10000){
		result = result.replace('$','');
		i = i +1;
	}

	result = nl + result;
	ints = '';
	strings = '';
	booleans = '';
	hasDollarSign.forEach(d=>{
		if (d.startsWith('$is') || d.includes('notSure') || d.includes('flag') || d.includes('Flag') || d.includes('userResponse') || d.includes('analysisBasic' || d.includes('analysisCustom'))){
			booleans = booleans + 'bool ' + d.replace('$','') + ' = false;' + nl;
		}
		else if(d.includes('Duration') || d.includes('duration')){
			ints = ints + 'int ' + d.replace('$','') + ' = 0;' + nl;
		}
		else{
			strings = strings + 'string ' + d.replace('$','') + ' = "NONE";' + nl;
		}
	});

	
	//preBaked is a hard coded string for class and function declarations..
	preBaked = 'using System.Collections;\nusing System.Collections.Generic;\nusing UnityEngine;\n\npublic class Dialogue : MonoBehaviour\n{\n\n\tpublic Controller controller;\n\tpublic bool CompareMeaning(List<string> sentences)\n\t{\n\t\t//T0D0\n\t\t//implement an actual semantic similarity checker\n\t\t//currently this function compares string literals\n\t\tstring userSpeech = sentences[0];\n\t\tstring toCheckAgainst;\n\t\tint l = sentences.Count;\n\t\tint i = 1;\n\t\tbool areSimilar = false;\n\t\twhile (i < l)\n\t\t{\n\t\t\ttoCheckAgainst = sentences[i];\n\t\t\tif (userSpeech == toCheckAgainst)\n\t\t\t{\n\t\t\t\tareSimilar = true;\n\t\t\t}\n\t\t\ti++;\n\t\t}\n\t\treturn areSimilar;\n\t}\n\n\tpublic void GetNext()\n\t{';
	sentencesList = 'List<string> sentences = new List<string> ();' + nl;
	outputtingStr = '';
	outputting.forEach(o=>{
		if (o.includes('nextNode')){
			outputtingStr = outputtingStr + 'controller.current_node = nextNode;' +nl;
		}else{
			outputtingStr = outputtingStr + 'controller.' + strCleaner(o) + ' = ' + strCleaner(o) + ';' + nl;
		}
	});


	result = preBaked + booleans + ints + strings + sentencesList +'while( isAnimationNode == false ){' + nl + result + nl + outputtingStr+ '}' + nl + '}' + nl + '}';
	//console.log(outputting);
	//console.log(hasDollarSign);

    return result;
  };


module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		story: {
			type: Object,
			required: true
		}
	},

	methods: {
		editScript(e) {
			/*
			We have to manually inject the Vuex store, since the editors are
			mounted outside the app scope.
			*/

			new JavaScriptEditor({
				data: { storyId: this.story.id, origin: e.target },
				store: this.$store
			}).$mountTo(document.body);
		},

		editStyle(e) {
			new StylesheetEditor({
				data: { storyId: this.story.id, origin: e.target },
				store: this.$store
			}).$mountTo(document.body);
		},

		renameStory(e) {
			prompt({
				message:
					locale.say(
						'What should &ldquo;%s&rdquo; be renamed to?',
						escape(this.story.name)
					),
				buttonLabel:
					'<i class="fa fa-ok"></i> ' + locale.say('Rename'),
				response:
					this.story.name,
				blankTextError:
					locale.say('Please enter a name.'),
				origin:
					e.target
			})
			.then(text => this.updateStory(this.story.id, { name: text }));
		},

		selectAll() {
			this.selectPassages(this.story.id, () => true);
		},
		deleteAll() {
			this.deletePassages(this.story.id, () => true);
		},
		proofRead() {
			window.open(
				'#!/stories/' + this.story.id + '/proofRead',
				'twinestory_proofRead_' + this.story.id
			);
		},
		extractAnimations() {
			window.open(
				'#!/stories/' + this.story.id + '/animations',
				'twinestory_animations_' + this.story.id
			);
		},
		extractSentences() {
			window.open(
				'#!/stories/' + this.story.id + '/sentences',
				'twinestory_sentences_' + this.story.id
			);
		},
		extractSounds() {
			window.open(
				'#!/stories/' + this.story.id + '/sounds',
				'twinestory_sounds_' + this.story.id
			);
		},
		extractLights() {
			window.open(
				'#!/stories/' + this.story.id + '/lighting',
				'twinestory_lighting_' + this.story.id
			);
		},
		extractModels() {
			window.open(
				'#!/stories/' + this.story.id + '/models',
				'twinestory_models_' + this.story.id
			);
		},


		unityStory() {
			//saves a unity script compatible
			//with Amir Baradaran's Avatar project 
			//...
			parsed = unityParser(this.story);
			save(
				parsed,
				this.story.name + '.cs'
			);
		},

		publishStory() {
			this.loadFormat(
				this.story.storyFormat,
				this.story.storyFormatVersion
			).then(format => {
				save(
					publishStoryWithFormat(this.appInfo, this.story, format),
					this.story.name + '.html'
				);
			});
		},

		storyStats(e) {
			new StatsDialog({
				data: { storyId: this.story.id, origin: e.target },
				store: this.$store
			}).$mountTo(document.body);
		},

		changeFormat(e) {
			new FormatDialog({
				data: { storyId: this.story.id, origin: e.target },
				store: this.$store
			}).$mountTo(document.body);
		},

		toggleSnap() {
			this.updateStory(
				this.story.id,
				{ snapToGrid: this.story.snapToGrid }
			);
		}
	},

	components: {
		'drop-down': require('../../../ui/drop-down')
	},

	vuex: {
		actions: {
			loadFormat,
			selectPassages,
			updateStory
		},

		getters: {
			allFormats: state => state.storyFormat.formats,
			appInfo: state => state.appInfo,
			defaultFormatName: state => state.pref.defaultFormat
		}
	}
});
