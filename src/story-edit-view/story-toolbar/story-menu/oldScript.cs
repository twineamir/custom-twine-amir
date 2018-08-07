using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Dialogue : MonoBehaviour
{

    public Controller controller;
    public bool SimilarityCheck(List<string> toCompare)
    {
        //T0D0
        //implement an actual semantic similarity checker
        //currently this function compares string literals
        string userSpeech = toCompare[0];
        string toCheckAgainst;
        int l = toCompare.Count;
        int i = 1;
        bool areSimilar = false;
        while (i < l)
        {
            toCheckAgainst = toCompare[i];
            if (userSpeech == toCheckAgainst)
            {
                areSimilar = true;
            }
            i++;
        }
        return areSimilar;
    }

    public void GetNext()
    {
        string nextNode = "NONE";
        string currentNode = controller.current_node;
        string MicSpeech = controller.user.user_lines.Peek().toString();
        string CamF = "";
        bool AnalysisBasicAdventurousness = controller.user.traits.adventurousness.has_trait;
        string Avatar1NextText = "";
        string Avatar2NextText = "";
        string hometown = controller.user.location;
        string first_name = controller.user.first_name;
        string email_server_name = controller.user.email_server_name;
        string email_handle = controller.user.email_handle;
        string movie_last_liked_title = controller.user.movies[0].title;
        string movie_last_liked_genre = controller.user.movies[0].genre;

        //avatar animation IDs....
        string Avatar1FaceModel = "NONE";
        string Avatar1FaceAnim = "NONE";
        string Avatar1BodyModel = "NONE";
        string Avatar1BodyAnim = "NONE";
        string Avatar1BodyAnimDur = "NONE";
        string Avatar1VoiceName = "NONE";
        string Avatar1VoiceEffects = "NONE";
        string Avatar2FaceModel = "NONE";
        string Avatar2FaceAnim = "NONE";
        string Avatar2BodyModel = "NONE";
        string Avatar2BodyAnim = "NONE";
        string Avatar2BodyAnimDur = "NONE";
        string Avatar2VoiceName = "NONE";
        string Avatar2VoiceEffects = "NONE";
        //scene variables...
        string SceneRendering = "NONE";
        string SceneLighting = "NONE";
        string SceneSound = "NONE";
        string NarratorSound = "NONE";
        string Screen = "NONE";
        //booleans...
        bool IsAvatarNode = false;
        bool IsRandom = false;
        bool IsConditional = false;
        bool IsSpecific = false;
        bool IsOpen = false;
        bool CamFFlag1 = false;
        bool AnalysisBasicFlag1 = false;
        bool AnalysisCustomFlag1 = false;
        bool CamFFlag2 = false;
        bool AnalysisBasicFlag2 = false;
        bool AnalysisCustomFlag2 = false;
        bool UserResponse1 = false;
        bool UserResponse2 = false;
        bool MicSpeechFlag1 = false;
        bool AnalysisBasicAdventurousnessFlag1 = false;
        bool MicSpeechFlag2 = false;
        bool AnalysisBasicAdventurousnessFlag2 = false;

        List<string> toCompare = new List<string>();

        while (IsAvatarNode == false)
        {
            if (currentNode == "START")
            {

                Avatar1FaceModel = "NONE";
                Avatar1FaceAnim = "NONE";
                Avatar1BodyModel = "AvatarBodyModel_Bodysuit";
                Avatar1BodyAnim = "AvatarBodyAnim_Stand_Idle";
                Avatar1BodyAnimDur = "2";
                Avatar1VoiceName = "NONE";
                Avatar1VoiceEffects = "NONE";
                Avatar2FaceModel = "NONE";
                Avatar2FaceAnim = "NONE";
                Avatar2BodyModel = "NONE";
                Avatar2BodyAnim = "AvatarBodyAnim_Stand_Idle";
                Avatar2BodyAnimDur = "NONE";
                Avatar2VoiceName = "NONE";
                Avatar2VoiceEffects = "NONE";
                SceneRendering = "SceneRendering_1";
                SceneLighting = "SceneLighting_Spotlight";
                SceneSound = "SceneSound_Intro";
                NarratorSound = "NONE";
                Screen = "NONE";
                SceneRendering = "SceneRendering_1";
                SceneLighting = "SceneLighting_Spotlight";
                SceneSound = "SceneSound_Intro";
                NarratorSound = "NONE";
                Screen = "NONE";
                nextNode = "Avatar2";
                Avatar1NextText = "";
                Avatar2NextText = "";

                IsAvatarNode = true;
            }

            if (currentNode == "Avatar2")
            {

                Avatar1FaceModel = "NONE";
                Avatar1FaceAnim = "NONE";
                Avatar1BodyModel = "AvatarBodyModel_Bodysuit";
                Avatar1BodyAnim = "AvatarBodyAnim_Stand_Walking";
                Avatar1BodyAnimDur = "2";
                Avatar1VoiceName = "NONE";
                Avatar1VoiceEffects = "NONE";
                Avatar2FaceModel = "NONE";
                Avatar2FaceAnim = "NONE";
                Avatar2BodyModel = "NONE";
                Avatar2BodyAnim = "AvatarBodyAnim_Stand_Walking";
                Avatar2BodyAnimDur = "NONE";
                Avatar2VoiceName = "NONE";
                Avatar2VoiceEffects = "NONE";
                SceneRendering = "SceneRendering_1";
                SceneLighting = "SceneLighting_Spotlight";
                SceneSound = "SceneSound_Intro";
                NarratorSound = "NONE";
                Screen = "NONE";
                SceneRendering = "SceneRendering_1";
                SceneLighting = "SceneLighting_Spotlight";
                SceneSound = "SceneSound_Intro";
                NarratorSound = "NONE";
                Screen = "NONE";
                nextNode = "Avatar3";
                Avatar1NextText = "";
                Avatar2NextText = "";

                IsAvatarNode = true;
            }

            if (currentNode == "Avatar3")
            {

                Avatar1FaceModel = "NONE";
                Avatar1FaceAnim = "NONE";
                Avatar1BodyModel = "AvatarBodyModel_Sit_Idle";
                Avatar1BodyAnim = "AvatarBodyAnim_Sit_Idle";
                Avatar1VoiceName = "NONE";
                Avatar1VoiceEffects = "NONE";
                Avatar2FaceModel = "NONE";
                Avatar2FaceAnim = "NONE";
                Avatar2BodyModel = "NONE";
                Avatar2BodyAnim = "AvatarBodyAnim_Sit_Idle";
                Avatar2VoiceName = "NONE";
                Avatar2VoiceEffects = "NONE";
                SceneRendering = "SceneRendering_1";
                SceneLighting = "SceneLighting_Spotlight";
                SceneSound = "SceneSound_";
                NarratorSound = "NONE";
                Screen = "NONE";
                nextNode = "Avatar4";
                Avatar1NextText = "";
                Avatar2NextText = "";

                IsAvatarNode = true;
            }

            if (currentNode == "Avatar4")
            {

                Avatar1FaceModel = "NONE";
                Avatar1FaceAnim = "NONE";
                Avatar1BodyModel = "AvatarBodyModel_Bodysuit";
                Avatar1BodyAnim = "AvatarBodyAnim_Sit_Talking";
                Avatar1VoiceName = "NONE";
                Avatar1VoiceEffects = "NONE";
                Avatar2FaceModel = "NONE";
                Avatar2FaceAnim = "NONE";
                Avatar2BodyModel = "NONE";
                Avatar2BodyAnim = "AvatarBodyAnim_Sit_Idle";
                Avatar2VoiceName = "NONE";
                Avatar2VoiceEffects = "NONE";
                SceneRendering = "SceneRendering_1";
                SceneLighting = "SceneLighting_Spotlight";
                SceneSound = "SceneSound_";
                NarratorSound = "NONE";
                Screen = "NONE";
                nextNode = "Avatar5";
                Avatar1NextText = "Welcome to my late night show! Thanks for coming out. It's getting hot in here!";
                Avatar2NextText = "";

                IsAvatarNode = true;
            }

            if (currentNode == "Avatar5")
            {

                Avatar1FaceModel = "NONE";
                Avatar1FaceAnim = "NONE";
                Avatar1BodyModel = "AvatarBodyModel_Bodysuit";
                Avatar1BodyAnim = "AvatarBodyAnim_Sit_Talking";
                Avatar1VoiceName = "NONE";
                Avatar1VoiceEffects = "NONE";
                Avatar2FaceModel = "NONE";
                Avatar2FaceAnim = "NONE";
                Avatar2BodyModel = "NONE";
                Avatar2BodyAnim = "AvatarBodyAnim_Sit_Idle";
                Avatar2VoiceName = "NONE";
                Avatar2VoiceEffects = "NONE";
                SceneRendering = "SceneRendering_1";
                SceneLighting = "SceneLighting_Spotlight";
                SceneSound = "SceneSound_";
                NarratorSound = "NONE";
                Screen = "NONE";
                nextNode = "Avatar6";
                Avatar1NextText = "Oh, I see we have someone from " + hometown + " in the audience. Thanks for joining us, " + first_name + " Happy to see you in the crowd.";
                Avatar2NextText = "";

                IsAvatarNode = true;
            }

            if (currentNode == "Avatar6")
            {

                Avatar1FaceModel = "NONE";
                Avatar1FaceAnim = "NONE";
                Avatar1BodyModel = "AvatarBodyModel_Bodysuit";
                Avatar1BodyAnim = "AvatarBodyAnim_Sit_Idle";
                Avatar1VoiceName = "NONE";
                Avatar1VoiceEffects = "NONE";
                Avatar2FaceModel = "NONE";
                Avatar2FaceAnim = "NONE";
                Avatar2BodyModel = "NONE";
                Avatar2BodyAnim = "AvatarBodyAnim_Sit_Idle";
                Avatar2VoiceName = "NONE";
                Avatar2VoiceEffects = "NONE";
                SceneRendering = "SceneRendering_1";
                SceneLighting = "SceneLighting_Spotlight";
                SceneSound = "SceneSound_";
                NarratorSound = "NONE";
                Screen = "NONE";
                nextNode = "Logic1";
                Avatar1NextText = "Guess who our guest is today? He directed " + movie_last_liked_title + ". You're a fan of that movie, aren't you?";
                Avatar2NextText = "";

                IsAvatarNode = true;
            }

            if (currentNode == "Logic1")
            {

                IsRandom = false;
                IsConditional = true;
                IsSpecific = false;
                IsOpen = false;
                toCompare.Clear();
                toCompare.Add(MicSpeech);
                toCompare.Add("Yes");
                if (SimilarityCheck(toCompare) == true)
                {
                    MicSpeechFlag1 = true;
                }
                CamFFlag1 = true;
                AnalysisBasicFlag1 = true;
                AnalysisCustomFlag1 = true;
                if (MicSpeechFlag1 && CamFFlag1 && AnalysisBasicFlag1 && AnalysisCustomFlag1) { UserResponse1 = true; }
                toCompare.Clear();
                toCompare.Add(MicSpeech);
                toCompare.Add("No");
                if (SimilarityCheck(toCompare) == true)
                {
                    MicSpeechFlag2 = true;
                }
                CamFFlag2 = true;
                AnalysisBasicFlag2 = true;
                AnalysisCustomFlag2 = true;
                if (MicSpeechFlag2 && CamFFlag2 && AnalysisBasicFlag2 && AnalysisCustomFlag2) { UserResponse2 = true; }

                if (IsRandom == true)
                {
                    string[] options1 = new string[2];
                    options1[0] = "User1";
                    options1[1] = "User2";
                    currentNode = options1[Random.Range(0, options1.Length)];
                }

                if (IsConditional && UserResponse1 == true)
                {
                    currentNode = "User1";
                }
                if (IsConditional && UserResponse2 == true)
                {
                    currentNode = "User2";
                }

                IsAvatarNode = false;
            }

            if (currentNode == "User1")
            {

                currentNode = "Avatar8";

                IsAvatarNode = false;
            }

            if (currentNode == "User2")
            {

                currentNode = "Avatar7";

                IsAvatarNode = false;
            }

            if (currentNode == "Avatar7")
            {

                Avatar1FaceModel = "NONE";
                Avatar1FaceAnim = "NONE";
                Avatar1BodyModel = "AvatarBodyModel_Bodysuit";
                Avatar1BodyAnim = "AvatarBodyAnim_Sit_Idle";
                Avatar1VoiceName = "NONE";
                Avatar1VoiceEffects = "NONE";
                Avatar2FaceModel = "NONE";
                Avatar2FaceAnim = "NONE";
                Avatar2BodyModel = "NONE";
                Avatar2BodyAnim = "AvatarBodyAnim_Sit_Idle";
                Avatar2VoiceName = "NONE";
                Avatar2VoiceEffects = "NONE";
                SceneRendering = "SceneRendering_1";
                SceneLighting = "SceneLighting_Spotlight";
                SceneSound = "SceneSound_";
                NarratorSound = "NONE";
                Screen = "NONE";
                nextNode = "Avatar8";
                Avatar1NextText = "You can't lie to me, you know. It's the Facebook era. And do you know how I write my era? I use capital A, capital I, r a. Anyway...";
                Avatar2NextText = "";

                IsAvatarNode = true;
            }

            if (currentNode == "Avatar8")
            {

                Avatar1FaceModel = "NONE";
                Avatar1FaceAnim = "NONE";
                Avatar1BodyModel = "AvatarBodyModel_Bodysuit";
                Avatar1BodyAnim = "AvatarBodyAnim_Sit_Talking";
                Avatar1VoiceName = "NONE";
                Avatar1VoiceEffects = "NONE";
                Avatar2FaceModel = "NONE";
                Avatar2FaceAnim = "NONE";
                Avatar2BodyModel = "NONE";
                Avatar2BodyAnim = "AvatarBodyAnim_Sit_Idle";
                Avatar2VoiceName = "NONE";
                Avatar2VoiceEffects = "NONE";
                SceneRendering = "SceneRendering_1";
                SceneLighting = "SceneLighting_Spotlight";
                SceneSound = "SceneSound_";
                NarratorSound = "NONE";
                Screen = "NONE";
                nextNode = "Avatar9";
                Avatar1NextText = "Put your hands together and let us welcome the best director of the " + movie_last_liked_genre + " genre in the world -- Mr. X!";
                Avatar2NextText = "";

                IsAvatarNode = true;
            }

            if (currentNode == "Avatar9")
            {

                Avatar1FaceModel = "NONE";
                Avatar1FaceAnim = "NONE";
                Avatar1BodyModel = "AvatarBodyModel_Bodysuit";
                Avatar1BodyAnim = "AvatarBodyAnim_Sit_Idle";
                Avatar1VoiceName = "NONE";
                Avatar1VoiceEffects = "NONE";
                Avatar2FaceModel = "NONE";
                Avatar2FaceAnim = "NONE";
                Avatar2BodyModel = "AvatarBodyModel_2";
                Avatar2BodyAnim = "AvatarBodyAnim_Sit_Idle";
                Avatar2VoiceName = "NONE";
                Avatar2VoiceEffects = "NONE";
                SceneRendering = "SceneRendering_1";
                SceneLighting = "SceneLighting_Spotlight";
                SceneSound = "SceneSound_";
                NarratorSound = "NONE";
                Screen = "NONE";
                nextNode = "Avatar10";
                Avatar1NextText = "";
                Avatar2NextText = "";

                IsAvatarNode = true;
            }

            if (currentNode == "Avatar10")
            {
                Debug.Log(currentNode);
                Avatar1FaceModel = "NONE";
                Avatar1FaceAnim = "NONE";
                Avatar1BodyModel = "AvatarBodyModel_Bodysuit";
                Avatar1BodyAnim = "AvatarBodyAnim_Sit_Idle";
                Avatar1VoiceName = "NONE";
                Avatar1VoiceEffects = "NONE";
                Avatar2FaceModel = "NONE";
                Avatar2FaceAnim = "NONE";
                Avatar2BodyModel = "AvatarBodyModel_2";
                Avatar2BodyAnim = "AvatarBodyAnim_Sit_Talking";
                Avatar2VoiceName = "NONE";
                Avatar2VoiceEffects = "NONE";
                SceneRendering = "SceneRendering_1";
                SceneLighting = "SceneLighting_Spotlight";
                SceneSound = "SceneSound_";
                NarratorSound = "NONE";
                Screen = "NONE";
                nextNode = "Avatar11";
                Avatar1NextText = "";
                Avatar2NextText = "So good to see you, Amir! Thank you for having me.";

                IsAvatarNode = true;
            }

            if (currentNode == "Avatar11")
            {

                Avatar1FaceModel = "NONE";
                Avatar1FaceAnim = "NONE";
                Avatar1BodyModel = "AvatarBodyModel_Bodysuit";
                Avatar1BodyAnim = "AvatarBodyAnim_Sit_Idle";
                Avatar1VoiceName = "NONE";
                Avatar1VoiceEffects = "NONE";
                Avatar2FaceModel = "NONE";
                Avatar2FaceAnim = "NONE";
                Avatar2BodyModel = "AvatarBodyModel_Bodysuit";
                Avatar2BodyAnim = "AvatarBodyAnim_Sit_Idle";
                Avatar2VoiceName = "NONE";
                Avatar2VoiceEffects = "NONE";
                SceneRendering = "SceneRendering_1";
                SceneLighting = "SceneLighting_Spotlight";
                SceneSound = "SceneSound_";
                NarratorSound = "NONE";
                Screen = "NONE";
                nextNode = "Logic2";
                Avatar1NextText = "";
                Avatar2NextText = "Look, we've got a " + email_server_name + " user here! What's up, " + email_handle;

                IsAvatarNode = true;
            }

            if (currentNode == "Logic2")
            {

                IsRandom = false;
                IsConditional = true;
                IsSpecific = false;
                IsOpen = false;
                MicSpeechFlag1 = true;
                CamFFlag1 = true;
                if (AnalysisBasicAdventurousness == true) { AnalysisBasicAdventurousnessFlag1 = true; }
                AnalysisCustomFlag1 = true;
                if (MicSpeechFlag1 && CamFFlag1 && AnalysisBasicAdventurousnessFlag1 && AnalysisCustomFlag1) { UserResponse1 = true; }
                MicSpeechFlag2 = true;
                CamFFlag2 = true;
                if (AnalysisBasicAdventurousness == false) { AnalysisBasicAdventurousnessFlag2 = true; }
                AnalysisCustomFlag2 = true;
                if (MicSpeechFlag2 && CamFFlag2 && AnalysisBasicAdventurousnessFlag2 && AnalysisCustomFlag2) { UserResponse2 = true; }

                if (IsRandom == true)
                {
                    string[] options2 = new string[2];
                    options2[0] = "User3";
                    options2[1] = "User4";
                    currentNode = options2[Random.Range(0, options2.Length)];
                }

                if (IsConditional && UserResponse1 == true)
                {
                    currentNode = "User3";
                }
                if (IsConditional && UserResponse2 == true)
                {
                    currentNode = "User4";
                }

                IsAvatarNode = false;
            }

            if (currentNode == "User3")
            {

                currentNode = "Avatar12";

                IsAvatarNode = false;
            }

            if (currentNode == "User4")
            {

                currentNode = "Avatar13";

                IsAvatarNode = false;
            }

            if (currentNode == "Avatar12")
            {

                Avatar1FaceModel = "NONE";
                Avatar1FaceAnim = "NONE";
                Avatar1BodyModel = "AvatarBodyModel_Bodysuit";
                Avatar1BodyAnim = "AvatarBodyAnim_SitToStand";
                Avatar1VoiceName = "NONE";
                Avatar1VoiceEffects = "NONE";
                Avatar2FaceModel = "NONE";
                Avatar2FaceAnim = "NONE";
                Avatar2BodyModel = "AvatarBodyModel_Bodysuit";
                Avatar2BodyAnim = "AvatarBodyAnim_SitToStand";
                Avatar2VoiceName = "NONE";
                Avatar2VoiceEffects = "NONE";
                SceneRendering = "SceneRendering_1";
                SceneLighting = "SceneLighting_Spotlight";
                SceneSound = "SceneSound_";
                NarratorSound = "NONE";
                Screen = "NONE";
                nextNode = "Avatar14";
                Avatar1NextText = "";
                Avatar2NextText = "You seem pretty adventurous. It makes me want to dance for you.";

                IsAvatarNode = true;
            }

            if (currentNode == "Avatar13")
            {

                Avatar1FaceModel = "NONE";
                Avatar1FaceAnim = "NONE";
                Avatar1BodyModel = "AvatarBodyModel_Bodysuit";
                Avatar1BodyAnim = "AvatarBodyAnim_Stand_Samba";
                Avatar1VoiceName = "NONE";
                Avatar1VoiceEffects = "NONE";
                Avatar2FaceModel = "NONE";
                Avatar2FaceAnim = "NONE";
                Avatar2BodyModel = "AvatarBodyModel_Bodysuit";
                Avatar2BodyAnim = "AvatarBodyAnim_Stand_Idle";
                Avatar2VoiceName = "NONE";
                Avatar2VoiceEffects = "NONE";
                SceneRendering = "SceneRendering_1";
                SceneLighting = "SceneLighting_Spotlight";
                SceneSound = "SceneSound_";
                NarratorSound = "NONE";
                Screen = "NONE";
                nextNode = "Avatar14";
                Avatar1NextText = "If you were more adventurous, I would have asked Mr. X to dance for you.";
                Avatar2NextText = "";

                IsAvatarNode = true;
            }

            if (currentNode == "Avatar14")
            {

                Avatar1FaceModel = "NONE";
                Avatar1FaceAnim = "NONE";
                Avatar1BodyModel = "AvatarBodyModel_Bodysuit";
                Avatar1BodyAnim = "AvatarBodyAnim_Stand_Samba";
                Avatar1VoiceName = "NONE";
                Avatar1VoiceEffects = "NONE";
                Avatar2FaceModel = "NONE";
                Avatar2FaceAnim = "NONE";
                Avatar2BodyModel = "AvatarBodyModel_Bodysuit";
                Avatar2BodyAnim = "AvatarBodyAnim_Stand_Samba";
                Avatar2VoiceName = "NONE";
                Avatar2VoiceEffects = "NONE";
                SceneRendering = "SceneRendering_1";
                SceneLighting = "SceneLighting_Spotlight";
                SceneSound = "SceneSound_";
                NarratorSound = "NONE";
                Screen = "NONE";
                nextNode = "Avatar15";
                Avatar1NextText = "Well, that's all the time we have tonight! Stay tuned for the next episode.";
                Avatar2NextText = "";

                IsAvatarNode = true;
            }

            if (currentNode == "Avatar15")
            {

                Avatar1FaceModel = "NONE";
                Avatar1FaceAnim = "NONE";
                Avatar1BodyModel = "AvatarBodyModel_Bodysuit";
                Avatar1BodyAnim = "AvatarBodyAnim_Stand_Samba";
                Avatar1VoiceName = "NONE";
                Avatar1VoiceEffects = "NONE";
                Avatar2FaceModel = "NONE";
                Avatar2FaceAnim = "NONE";
                Avatar2BodyModel = "AvatarBodyModel_Bodysuit";
                Avatar2BodyAnim = "AvatarBodyAnim_Stand_Samba";
                Avatar2VoiceName = "NONE";
                Avatar2VoiceEffects = "NONE";
                SceneRendering = "SceneRendering_1";
                SceneLighting = "SceneLighting_";
                SceneSound = "SceneSound_";
                NarratorSound = "NONE";
                Screen = "NONE";
                Avatar1NextText = "";
                Avatar2NextText = "";

                IsAvatarNode = true;
            }



            //nextNode to be passed into GetNext()...
            controller.current_node = nextNode;
            //first Avatar animation calls...
            controller.Avatar1NextText = Avatar1NextText;
            controller.Avatar1FaceModel = Avatar1FaceModel;
            controller.Avatar1FaceAnim = Avatar1FaceAnim;
            controller.Avatar1BodyModel = Avatar1BodyModel;
            controller.Avatar1BodyAnim = Avatar1BodyAnim;
            controller.Avatar1BodyAnimDur = Avatar1BodyAnimDur;
            controller.Avatar1VoiceName = Avatar1VoiceName;
            controller.Avatar1VoiceEffects = Avatar1VoiceEffects;

            controller.Avatar2NextText = Avatar2NextText;
            controller.Avatar2FaceModel = Avatar2FaceModel;
            controller.Avatar2FaceAnim = Avatar2FaceAnim;
            controller.Avatar2BodyModel = Avatar2BodyModel;
            controller.Avatar2BodyAnim = Avatar2BodyAnim;
            controller.Avatar2BodyAnimDur = Avatar2BodyAnimDur;
            controller.Avatar2VoiceName = Avatar2VoiceName;
            controller.Avatar2VoiceEffects = Avatar2VoiceEffects;

            //scene animation calls...
            controller.SceneRendering = SceneRendering;
            controller.SceneLighting = SceneLighting;
            controller.SceneSound = SceneSound;
            controller.NarratorSound = NarratorSound;
            controller.Screen = Screen;

        }
    }
}
