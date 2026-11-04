/*:
@plugindesc Hide and skip message windows.
@author Ryanu

@param Hide Key
@desc Key that toggles message window visibility when pressed. See help for list.
@default h

@param Skip Key
@desc Key that skips messages when pressed. See help for list.
@default y

@param Show on New Page
@desc Whether the message window automatically becomes visible on a new page of dialogue. Boolean. Default false.
@type boolean
@default false

@param Enable Hide
@desc Enable message hiding. Boolean. Default true.
@type boolean
@default true

@param Enable Skip
@desc Enable message skipping. Boolean. Default true.
@type boolean
@default true

@param Skip Speed
@desc Change message skip speed.
@type number
@default 10

@param Enable Key Input
@desc Enables or disables hide and skip key input. Boolean. Default true.
@type boolean
@default true

@param Enable Touch and Mouse Input
@desc Enables or disables hide and skip touch and mouse input. This does not affect buttons. Boolean. Default true.
@type boolean
@default true

@param Enable Buttons
@desc Enables or disables hide and skip buttons. Boolean. Default true.
@type boolean
@default true

@param Button Size
@desc Size of hide and skip buttons. Default 28.
@type number
@default 28

@help
Message window visibility is toggled by pressing the selected key 
or right clicking. Skipping is started by holding left click or the selected 
key. Buttons also exist for both options.

Plugin Commands:
ShowMessageWindow: Makes message window visible on next page.
HideMessageWindow: Hides the message window.
StopSkipping: Forces skipping to stop.
StartSkipping: Forces skipping to start.
EnableButtons: Enables buttons.
DisableButtons: Disables buttons.


Key parameters take values:
a-z
0-9
tab
enter
shift
ctrl
alt
space
semicolon
comma
period
quote
Gamepad-compatible values:
ok       //      A
cancel   //      B
shift    //      X
menu     //      Y
pageup   //      LB
pagedown //      RB
up       //      D-pad up
down     //      D-pad down
left     //      D-pad left
right    //      D-pad right
*/

var Imported = Imported || {};
Imported.EPP_HideSkipMessage = true;

EPP_params = PluginManager.parameters('EPP_HideSkipMessage');
pButtonSize = Number(EPP_params['Button Size']);


(function() {
  var pKeyHide = String(EPP_params['Hide Key']).toLowerCase();
  var pKeySkip = String(EPP_params['Skip Key']).toLowerCase();
  var pSkipSpeed = Number(EPP_params['Skip Speed']);
  var pNewPage = (function() {
    var p = String(EPP_params['Show on New Page']).toLowerCase();
    if (p.match(/true/i)) {
      return true;
    } else if (p.match(/false/i)) {
      return false;
    } else {
      return Utils.isNwjs();
    }
  })();
  var messageSkip = (function() {
    var p = String(EPP_params['Enable Skip']).toLowerCase();
    if (p.match(/true/i)) {
      return true;
    } else if (p.match(/false/i)) {
      return false;
    } else {
      return Utils.isNwjs();
    }
  })();
  var enableHide = (function() {
    var p = String(EPP_params['Enable Hide']).toLowerCase();
    if (p.match(/true/i)) {
      return true;
    } else if (p.match(/false/i)) {
      return false;
    } else {
      return Utils.isNwjs();
    }
  })();
  var buttonsEnabled = (function() {
    var p = String(EPP_params['Enable Buttons']).toLowerCase();
    if (p.match(/true/i)) {
      return true;
    } else if (p.match(/false/i)) {
      return false;
    } else {
      return Utils.isNwjs();
    }
  })();
  var enableKeys = (function() {
    var p = String(EPP_params['Enable Key Input']).toLowerCase();
    if (p.match(/true/i)) {
      return true;
    } else if (p.match(/false/i)) {
      return false;
    } else {
      return Utils.isNwjs();
    }
  })();
  var enableTouch = (function() {
    var p = String(EPP_params['Enable Touch and Mouse Input']).toLowerCase();
    if (p.match(/true/i)) {
      return true;
    } else if (p.match(/false/i)) {
      return false;
    } else {
      return Utils.isNwjs();
    }
  })();

var key_ids = {
  "tab": 9, "enter": 13, "shift": 16, "ctrl": 17, "alt": 18, "space": 32,
  "0": 48, "1": 49, "2": 50, "3": 51, "4": 52, "5": 53, "6": 54, "7": 55, "8": 56, "9": 57,
  "a": 65, "b": 66, "c": 67, "d": 68, "e": 69, "f": 70, "g": 71, "h": 72, "i": 73, "j": 74, "k": 75, "l": 76, "m": 77,
  "n": 78, "o": 79, "p": 80, "q": 81, "r": 82, "s": 83, "t": 84, "u": 85, "v": 86, "w": 87, "x": 88, "y": 89, "z": 90,
  "semicolon": 186, "comma": 188, "period": 190, "quote": 222,
};

Input.keyMapper[key_ids[pKeyHide]] = 'messageHideToggleKey';
Input.keyMapper[key_ids[pKeySkip]] = 'messageSkipKey';

if (Imported.YEP_KeyboardConfig) {
  ConfigManager.wasdMap = {
    9: 'tab', 13: 'ok', 16: 'shift', 17: 'control', 18: 'control', 27: 'escape',
    32: 'ok', 33: 'pageup', 34: 'pagedown', 37: 'left', 38: 'up', 39: 'right',
    40: 'down', 87: 'up', 65: 'left', 83: 'down', 68: 'right', 74: 'ok',
    75: 'escape', 77: 'menu', 219: 'pageup',  221: 'pagedown', 45: 'escape',
    46: 'ok', 35: 'escape', 36: 'menu', 96: 'escape', 98: 'down', 100: 'left',
    102: 'right', 104: 'up', 120: 'debug', 72: 'messageHideToggleKey', 89: 'messageSkipKey'
  };

  alias_keyconfig_actionkey = Window_KeyConfig.prototype.actionKey;
  Window_KeyConfig.prototype.actionKey = function(action) {
    switch (action) {
      case 'ok':
			return Yanfly.Param.KeyConfigOkKey;
			break;
		case 'escape':
			return Yanfly.Param.KeyConfigEscKey;
			break;
		case 'cancel':
			return Yanfly.Param.KeyConfigCancelKey;
			break;
		case 'menu':
			return Yanfly.Param.KeyConfigMenuKey;
			break;
		case 'shift':
			return Yanfly.Param.KeyConfigShiftKey;
			break;
		case 'pageup':
			return Yanfly.Param.KeyConfigPageUpKey;
			break;
		case 'pagedown':
			return Yanfly.Param.KeyConfigPageDnKey;
			break;
		case 'left':
			return Yanfly.Param.KeyConfigLeftKey;
			break;
		case 'up':
			return Yanfly.Param.KeyConfigUpKey;
			break;
		case 'right':
			return Yanfly.Param.KeyConfigRightKey;
			break;
		case 'down':
			return Yanfly.Param.KeyConfigDownKey;
      break;
    case 'messageHideToggleKey':
      return 'Hide';
      break;
    case 'messageSkipKey':
      return 'Skip';
      break;
    default:
      if (Imported.YEP_ButtonCommonEvents) {
        if (Yanfly.Param.BCEList[action]) {
          var id = Yanfly.Param.BCEList[action];
          var ev = $dataCommonEvents[id];
          return ev.configKey;
        }
      }
      return '';
      break;
    }
  }

  alias_keyaction_mcl = Window_KeyAction.prototype.makeCommandList;
  Window_KeyAction.prototype.makeCommandList = function() {
    alias_keyaction_mcl.call(this);
    this.addCommand('Hide', 'ok', true, 'messageHideToggleKey');
    this.addCommand('Skip', 'ok', true, 'messageSkipKey');
  };
}

    EPP_messageWindowShowNext = false;
    EPP_messageWindowVisible = true;
    EPP_messageSkipSpeed = pSkipSpeed;
    enableSkip = false;
    EPP_HideSkipButtonsActive = buttonsEnabled;
    
    var alias_wm_ud = Window_Message.prototype.update;
    Window_Message.prototype.update = function() {
      if (messageSkip && enableSkip) {
        for (var i = 0; i < Math.floor(EPP_messageSkipSpeed); i++) {
          alias_wm_ud.call(this);
        }
      }
      else {
        alias_wm_ud.call(this);
      }
      this.processRightClick();
      if (enableHide && EPP_messageWindowShowNext) {
        EPP_messageWindowShowNext = false;
        EPP_messageWindowVisible = true;
      }
      else if (Input.isTriggered('messageHideToggleKey') && enableHide && enableKeys && ConfigManager.hideSkip) {
        EPP_messageWindowVisible = !EPP_messageWindowVisible;
      }
      else if (TouchInput.isTriggered() && !EPP_messageWindowVisible) {
        EPP_messageWindowVisible = true;
      }
      if (this._hideButton.visible || this._skipButton.visible) {
        this.processButtonTouch();
      }
      this.visible = EPP_messageWindowVisible;
      if (this._hideButton.isClosed()) {
        this._skipButton.close();
      }
      this.checkButtonVisibility();
      this.processSkipInput();
      this.processSkip();
    };

    Window_Message.prototype.processButtonTouch = function() {
      if (this._hideButton.isButtonTouched() && TouchInput.isTriggered() && enableHide) {
        EPP_messageWindowVisible = false;
        this.pause;
      }
      if (messageSkip && this._skipButton.isButtonTouched() && TouchInput.isTriggered()) {
        enableSkip = true;
      }
    }

    Window_Message.prototype.checkButtonVisibility = function() {
      if (!EPP_HideSkipButtonsActive) {
        this._hideButton.visible = false;
        this._skipButton.visible = false;
        return;
      }
      if (!$gameMessage.isChoice()) {
        this._hideButton.visible = this.visible;
        this._skipButton.visible = this.visible;
      }
      if ($gameMessage.isChoice() || this._background > 1 || !ConfigManager.hideSkip) {
        this._hideButton.visible = false;
        this._skipButton.visible = false;
      }
     
    }

    // var alias_wm_init = Window_Message.prototype.initialize;
    // Window_Message.prototype.initialize = function() {
    //   alias_wm_init.call(this);
    //   this._hideButton.refresh('Hide');
    //   this._skipButton.refresh('Skip');
    //   this._hideButton.update();
    //   this._skipButton.update();
    //   this._hideButton.deactivate();
    //   this._skipButton.deactivate();
    //   this._hideButton.hide();
    //   this._skipButton.hide();
    // }

    var alias_wm_init = Window_Message.prototype.initialize;
    Window_Message.prototype.initialize = function() {
      alias_wm_init.call(this);
      this._skipButton.refresh('Skip');
      this._skipButton.update();
      this._hideButton.refresh('Hide');
      this._hideButton.update();
      this._hideButton.visible = false;
      this._skipButton.visible = false;
      this._hideButton.close();
      this._skipButton.close();
    }

    var alias_wm_sm = Window_Message.prototype.startMessage;
    Window_Message.prototype.startMessage = function() {
      alias_wm_sm.call(this);
      if (!enableSkip) {
      EPP_SkipButton.refresh('Skip');
      EPP_SkipButton.update();
      EPP_HideButton.refresh('Hide');
      EPP_HideButton.update();
      }
    }
    
    var alias_wm_np = Window_Message.prototype.newPage;
    Window_Message.prototype.newPage = function(textState) {
      alias_wm_np.call(this, textState);
      if (pNewPage) EPP_messageWindowVisible = true;
      if(messageSkip && enableSkip && $gameMessage.positionType() !== this._positionType) {
        this.processSkip();
      }
    };
    
    var alias_wm_update_input = Window_Message.prototype.updateInput;
    Window_Message.prototype.updateInput = function() {
        if(this.pause && this.isTriggered() && !this.visible) {
            return true;
        }
        else if (!EPP_messageWindowVisible && this.isTriggered() && !this.visible) {
          return true;
        }
        return alias_wm_update_input.call(this);
    };

    Window_Message.prototype.isOpenAndActive = function() {
        return this.isOpen() && this.active;
    };

    Window_Message.prototype.processRightClick = function() {
      if (!ConfigManager.hideSkip) return;
        if(this.isOpenAndActive() && TouchInput.isCancelled() && !$gameMessage.isChoice() && enableHide && enableTouch) {
            EPP_messageWindowVisible = !EPP_messageWindowVisible;
        }
    };

    Window_Message.prototype.processSkipInput = function() {
      if (!ConfigManager.hideSkip) return;
      if ((Input.isLongPressed('messageSkipKey') && enableKeys) || (TouchInput.isLongPressed() && enableTouch)) {
        enableSkip = true;
      }
      else if (enableSkip && (Input.isTriggered('messageSkipKey') && enableKeys) || (!this.isOpenAndActive())) {
        enableSkip = false;
      }
        if ($gameMessage.isChoice() || $gameMessage.isItemChoice() || $gameMessage.isNumberInput()) {
          enableSkip = false;
        }
    }

    Window_Message.prototype.processSkip = function() {
      if (!ConfigManager.hideSkip) return;
      if (messageSkip && enableSkip && !$gameMessage.isChoice()) {
        this.pause = false;
        this.terminateMessage();
      }
    }

    var alias_wm_update_placement = Window_Message.prototype.updatePlacement;
    Window_Message.prototype.updatePlacement = function() {
      if (messageSkip && enableSkip) {
        for (var i = 0; i < Math.floor(EPP_messageSkipSpeed); i++) {
          alias_wm_update_placement.call(this);
        }
      }
      else {
        alias_wm_update_placement.call(this);
      }
      this.processSkip();
    }

    var alias_scnmgr_ud = SceneManager.prototype.update;
    SceneManager.prototype.update = function() {
        if (messageSkip && enableSkip) {
            for (var i = 0; i < Math.floor(EPP_messageSkipSpeed); i++) {
                alias_scnmgr_ud.call(this);
            }
        }
        else {
            alias_scnmgr_ud.call(this);
        }
    }

    var alias_gm_ud = Game_Message.prototype.update;
    Game_Message.prototype.update = function() {
      if (messageSkip && enableSkip) {
        for (var i = 0; i < Math.floor(EPP_messageSkipSpeed); i++) {
            alias_gm_ud.call(this);
        }
    }
      else {
        alias_gm_ud.call(this);
      }
    }

    var alias_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
      alias_Game_Interpreter_pluginCommand.call(this, command, args);
      switch (command) {
        case 'ShowMessageWindow':
          EPP_messageWindowShowNext = true;
          break;
        case 'StopSkipping':
          enableSkip = false;
          break;
        case 'StartSkipping':
          enableSkip = true;
          break;
        case 'EnableButtons':
          buttonsEnabled = true;
          EPP_HideSkipButtonsActive = true;
          break;
        case 'DisableButtons':
          buttonsEnabled = false;
          EPP_HideSkipButtonsActive = false;
          break;
        case 'HideMessageWindow':
          EPP_messageWindowVisible = false;
          break;
      }
   }

   if (Imported.YEP_MessageCore) {
     var alias_wmnb_update = Window_NameBox.prototype.update;
     Window_NameBox.prototype.update = function() {
       alias_wmnb_update.call(this);
       if (this._lastNameText === '') {
         this.visible = false;
       }
       else {
          this.visible = EPP_messageWindowVisible;
       }
     }
   }

   var alias_hideButton_ud = HideButton.prototype.update;
   HideButton.prototype.update = function() {
     alias_hideButton_ud.call(this);
     if (this._text === '' || !this.isOpenAndActive()) {
       this.visible = false;
     }
     else {
       this.visible = this._parentWindow.visible;
     }
    //this.refresh();
   }

   var alias_skipButton_ud = SkipButton.prototype.update;
   SkipButton.prototype.update = function() {
     alias_skipButton_ud.call(this);
     if (this._text === '' || !this.isOpenAndActive()) {
      this.visible = false;
    }
     else {
      this.visible = this._parentWindow.visible;
    }
    //this.refresh();
   }

  //  var alias_touch_input = TouchInput.prototype.isTriggered;
  //  TouchInput.prototype.isTriggered = function() {
  //    if (EPP_HideSkipButtonsActive) {
  //      if (Window_Message._skipButton.isButtonTouched() || Window_Message._hideButton.isButtonTouched()) {
  //        if (Window_Message._skipButton.isButtonTouched()) {
  //          enableSkip = true;
  //         } else if (Window_Message._hideButton.isButtonTouched()) {
  //           EPP_messageWindowVisible = !EPP_messageWindowVisible;
  //         }
  //         return;
  //       }
  //     }
  //     alias_touch_input.call(this);
  //  }
})();

 /* Buttons */

 function HideButton() {
  this.initialize.apply(this, arguments);
}

HideButton.prototype = Object.create(Window_Base.prototype);
HideButton.prototype.constructor = HideButton;

HideButton.prototype.initialize = function(parentWindow) {
 this._parentWindow = parentWindow;
 Window_Base.prototype.initialize.call(this, 0, 0, 240, this.windowHeight());
 this._text = 'Hide';
 this._openness = 0;
 this._closeCounter = 0;
 this.deactivate();
 this.hide();
}

HideButton.prototype.windowWidth = function() {
 this.resetFontSettings();
 var dw = this.textWidthEx(this._text);
 dw += this.padding * 2;
 var width = dw + this.standardPadding() * 4 * (pButtonSize / 28);
 return Math.ceil(width);
};

HideButton.prototype.textWidthEx = function(text) {
 return this.drawTextEx(text, 0, this.contents.height);
};

HideButton.prototype.calcNormalCharacter = function(textState) {
 return this.textWidth(textState.text[textState.index++]);
};

HideButton.prototype.windowHeight = function() {
 return this.fittingHeight(1);
};

HideButton.prototype.standardFontFace = function() {
 return $gameSystem.getMessageFontName();
};

HideButton.prototype.standardFontSize = function() {
 return $gameSystem.getMessageFontSize();
};

HideButton.prototype.update = function() {
 Window_Base.prototype.update.call(this);
 if (this.active) return;
 if (this.isClosed()) return;
 if (this.isClosing()) return;
 if (this._closeCounter-- > 0) return;
 if (this._parentWindow.isClosing()) {
   this._openness = this._parentWindow.openness;
 }
 this.close();
};

HideButton.prototype.refresh = function(text) {
 this.show();
 this._text = text;
 this._position = 2;
 this.width = this.windowWidth();
 this.createContents();
 this.contents.clear();
 this.resetFontSettings();
 var padding = (this.standardPadding() * 4 / 2) * (pButtonSize / 28);
 this.drawTextEx(this._text, padding, 0, this.contents.width);
 this._parentWindow.adjustWindowSettings();
 this._parentWindow.updatePlacement();
 this.adjustPositionX();
 this.adjustPositionY();
 this.open();
 this.activate();
 this._closeCounter = 4;
 return '';
};

HideButton.prototype.adjustPositionX = function() {
 this.x = this._parentWindow.x + this._parentWindow.width;
 this.x -= this.width;
 this.x -= EPP_SkipButton.width;
 this.x = this.x.clamp(0, Graphics.boxWidth - this.width);
};

HideButton.prototype.adjustPositionY = function() {
  if($gameMessage.positionType() === 2 || $gameMessage.positionType() === 1) {
    this.y = this._parentWindow.y;
    this.y -= this.height;
  }
  else {
    this.y = this._parentWindow.y;
    this.y += this._parentWindow.height;
  }
};

HideButton.prototype.isButtonTouched = function() {
var x = this.canvasToLocalX(TouchInput.x);
var y = this.canvasToLocalY(TouchInput.y);
return x >= 0 && y >= 0 && x < this.width && y < this.height;
};

HideButton.prototype.canvasToLocalX = function(x) {
var node = this;
while (node) {
   x -= node.x;
   node = node.parentElement;
}
return x;
};

HideButton.prototype.canvasToLocalY = function(y) {
var node = this;
while (node) {
   y -= node.y;
   node = node.parentElement;
}
return y;
};

function SkipButton() {
 this.initialize.apply(this, arguments);
}

SkipButton.prototype = Object.create(Window_Base.prototype);
SkipButton.prototype.constructor = SkipButton;

SkipButton.prototype.initialize = function(parentWindow) {
this._parentWindow = parentWindow;
Window_Base.prototype.initialize.call(this, 0, 0, 240, this.windowHeight());
this._text = 'Skip';
this._openness = 0;
this._closeCounter = 0;
this.deactivate();
this.hide();
}

SkipButton.prototype.windowWidth = function() {
this.resetFontSettings();
var dw = this.textWidthEx(this._text);
dw += this.padding * 2;
var width = dw + this.standardPadding() * 4 * (pButtonSize / 28);
return Math.ceil(width);
};

SkipButton.prototype.textWidthEx = function(text) {
return this.drawTextEx(text, 0, this.contents.height);
};

SkipButton.prototype.calcNormalCharacter = function(textState) {
return this.textWidth(textState.text[textState.index++]);
};

SkipButton.prototype.windowHeight = function() {
return this.fittingHeight(1);
};

SkipButton.prototype.standardFontFace = function() {
return $gameSystem.getMessageFontName();
};

SkipButton.prototype.standardFontSize = function() {
return $gameSystem.getMessageFontSize();
};

SkipButton.prototype.update = function() {
Window_Base.prototype.update.call(this);
if (this.active) return;
if (this.isClosed()) return;
if (this.isClosing()) return;
if (this._closeCounter-- > 0) return;
if (this._parentWindow.isClosing()) {
 this._openness = this._parentWindow.openness;
}
this.close();
};

SkipButton.prototype.refresh = function(text) {
this.show();
this._text = text;
this._position = 2;
this.width = this.windowWidth();
this.createContents();
this.contents.clear();
this.resetFontSettings();
var padding = (this.standardPadding() * 4 / 2) * (pButtonSize / 28);
this.drawTextEx(this._text, padding, 0, this.contents.width);
this._parentWindow.adjustWindowSettings();
this._parentWindow.updatePlacement();
this.adjustPositionX();
this.adjustPositionY();
this.open();
this.activate();
this._closeCounter = 4;
return '';
};

SkipButton.prototype.adjustPositionX = function() {
    this.x = this._parentWindow.x + this._parentWindow.width;
    this.x -= this.width;
    this.x = this.x.clamp(0, Graphics.boxWidth - this.width);
};

SkipButton.prototype.adjustPositionY = function() {
  if($gameMessage.positionType() === 2 || $gameMessage.positionType() === 1) {
    this.y = this._parentWindow.y;
    this.y -= this.height;
  }
  else {
    this.y = this._parentWindow.y;
    this.y += this._parentWindow.height;
  }
};

SkipButton.prototype.isButtonTouched = function() {
var x = this.canvasToLocalX(TouchInput.x);
var y = this.canvasToLocalY(TouchInput.y);
return x >= 0 && y >= 0 && x < this.width && y < this.height;
};

SkipButton.prototype.canvasToLocalX = function(x) {
var node = this;
while (node) {
   x -= node.x;
   node = node.parent;
}
return x;
};

SkipButton.prototype.canvasToLocalY = function(y) {
var node = this;
while (node) {
   y -= node.y;
   node = node.parent;
}
return y;
};

alias_wm_csw = Window_Message.prototype.createSubWindows;
Window_Message.prototype.createSubWindows = function() {
  alias_wm_csw.call(this);
  this._hideButton = new HideButton(this);
  this._skipButton = new SkipButton(this);
  EPP_HideButton = this._hideButton;
  EPP_SkipButton = this._skipButton;
  var scene = SceneManager._scene;
  scene.addChild(this._hideButton);
  scene.addChild(this._skipButton);
}

alias_wm_sm = Window_Message.prototype.startMessage;
Window_Message.prototype.startMessage = function() {
  this._hideButton.deactivate();
  this._skipButton.deactivate();
  alias_wm_sm.call(this);
}

alias_wm_tm = Window_Message.prototype.terminateMessage;
Window_Message.prototype.terminateMessage = function() {
  this._hideButton.deactivate();
  this._skipButton.deactivate();
  alias_wm_tm.call(this);
}

if (!Imported.YEP_MessageCore) {
  Game_System.prototype.initMessageFontSettings = function() {
    if ($dataSystem.locale.match(/^zh/)) {
      this._msgFontName = ['SimHei, Heiti TC, sans-serif'];
    } else if ($dataSystem.locale.match(/^ko/)) {
      this._msgFontName = ['Dotum, AppleGothic, sans-serif'];
    } else {
      this._msgFontName = ['GameFont'];
    }
    this._msgFontSize = pButtonSize;
    this._msgFontOutline = 4;
  };
  
   Game_System.prototype.getMessageFontName = function() {
    if (this._msgFontName === undefined) this.initMessageFontSettings();
    return this._msgFontName;
  };
  
  Game_System.prototype.setMessageFontName = function(value) {
    if (this._msgFontName === undefined) this.initMessageFontSettings();
    this._msgFontName = value;
  };
  
  Game_System.prototype.getMessageFontSize = function() {
    if (this._msgFontSize === undefined) this.initMessageFontSettings();
    return this._msgFontSize;
  };
  
  Game_System.prototype.setMessageFontSize = function(value) {
    this._msgFontSize = value;
  };

  Game_System.prototype.getMessageFontOutline = function() {
    if (this._msgFontOutline === undefined) this.initMessageFontSettings();
    return this._msgFontOutline;
  };

Game_System.prototype.setMessageFontOutline = function(value) {
    if (this._msgFontOutline === undefined) this.initMessageFontSettings();
    this._msgFontOutline = value;
  };

  Window_Message.prototype.adjustWindowSettings = function() {
  this.width = this.windowWidth();
  this.height = Math.min(this.windowHeight(), Graphics.boxHeight);
  if (Math.abs(Graphics.boxHeight - this.height) < this.lineHeight()) {
    this.height = Graphics.boxHeight;
  }
  this.createContents();
  this.x = (Graphics.boxWidth - this.width) / 2;
  };

Window_Base.prototype.textWidthEx = function(text) {
  return this.drawTextEx(text, 0, this.contents.height + this.lineHeight());
};
}

/* Menu Option */

ConfigManager.hideSkip = true;

EPP_ConfigManager_makeData = ConfigManager.makeData;
ConfigManager.makeData = function() {
    var config = EPP_ConfigManager_makeData.call(this);
    config.hideSkip = this.hideSkip;
    return config;
};

EPP_ConfigManager_applyData = ConfigManager.applyData;
ConfigManager.applyData = function(config) {
    EPP_ConfigManager_applyData.call(this, config);
    this.hideSkip = this.readHideSkipEnabled(config, 'hideSkip');
};

ConfigManager.readHideSkipEnabled = function(config, name) {
    var value = config[name];
    if (value !== undefined) {
        return value;
    } else {
        return true;
    }
};

EPP_Window_Options_addGeneralOptions =
    Window_Options.prototype.addGeneralOptions;
Window_Options.prototype.addGeneralOptions = function() {
    EPP_Window_Options_addGeneralOptions.call(this);
    this.addCommand('Hide/Skip', 'hideSkip', true);
};