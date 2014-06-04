// Generated by CoffeeScript 1.6.3
(function() {
  var Command, RoomHelper, User, afkCheck, afksCommand, allAfksCommand, announceCurate, antispam, apiHooks, avgVoteRatioCommand, beggar, chatCommandDispatcher, chatUniversals, cmds, commandsCommand, cookieCommand, data, handleNewSong, handleUserJoin, handleUserLeave, handleVote, helpCommand, hook, initEnvironment, initHooks, initialize, msToStr, populateUserData, resetAfkCommand, roomHelpCommand, rulesCommand, settings, statusCommand, themeCommand, undoHooks, unhook, updateVotes, whyWootCommand, wootCommand, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref2, _ref20, _ref21, _ref22, _ref23, _ref24, _ref25, _ref26, _ref27, _ref28, _ref29, _ref3, _ref30, _ref31, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  settings = (function() {
    function settings() {
      this.implode = __bind(this.implode, this);
      this.intervalMessages = __bind(this.intervalMessages, this);
      this.startAfkInterval = __bind(this.startAfkInterval, this);
      this.setInternalWaitlist = __bind(this.setInternalWaitlist, this);
      this.userJoin = __bind(this.userJoin, this);
      this.getRoomUrlPath = __bind(this.getRoomUrlPath, this);
      this.startup = __bind(this.startup, this);
    }

    settings.prototype.currentsong = {};

    settings.prototype.users = {};

    settings.prototype.djs = [];

    settings.prototype.mods = [];

    settings.prototype.host = [];

    settings.prototype.hasWarned = false;

    settings.prototype.currentwoots = 0;

    settings.prototype.currentmehs = 0;

    settings.prototype.currentcurates = 0;

    settings.prototype.roomUrlPath = null;

    settings.prototype.internalWaitlist = [];

    settings.prototype.userDisconnectLog = [];

    settings.prototype.voteLog = {};

    settings.prototype.seshOn = false;

    settings.prototype.forceSkip = false;

    settings.prototype.seshMembers = [];

    settings.prototype.launchTime = null;

    settings.prototype.totalVotingData = {
      woots: 0,
      mehs: 0,
      curates: 0
    };

    settings.prototype.pupScriptUrl = '';

    settings.prototype.afkTime = 12 * 60 * 1000;

    settings.prototype.songIntervalMessages = [
      {
        interval: 15,
        offset: 0,
        msg: ""
      }
    ];

    settings.prototype.songCount = 0;

    settings.prototype.startup = function() {
      this.launchTime = new Date();
      return this.roomUrlPath = this.getRoomUrlPath();
    };

    settings.prototype.getRoomUrlPath = function() {
      return window.location.pathname.replace(/\//g, '');
    };

    settings.prototype.newSong = function() {
      this.totalVotingData.woots += this.currentwoots;
      this.totalVotingData.mehs += this.currentmehs;
      this.totalVotingData.curates += this.currentcurates;
      this.setInternalWaitlist();
      this.currentsong = API.getMedia();
      if (this.currentsong !== null) {
        return this.currentsong;
      } else {
        return false;
      }
    };

    settings.prototype.userJoin = function(u) {
      var userIds, _ref;
      userIds = Object.keys(this.users);
      if (_ref = u.id, __indexOf.call(userIds, _ref) >= 0) {
        return this.users[u.id].inRoom(true);
      } else {
        this.users[u.id] = new User(u);
        return this.voteLog[u.id] = {};
      }
    };

    settings.prototype.setInternalWaitlist = function() {

      return this.internalWaitlist = API.getWaitList();
    };

    settings.prototype.activity = function(obj) {
      if (obj.type === 'message') {
        return this.users[obj.fromID].updateActivity();
      }
    };

    settings.prototype.startAfkInterval = function() {
      return this.afkInterval = setInterval(afkCheck, 2000);
    };

    settings.prototype.intervalMessages = function() {
      var msg, _i, _len, _ref, _results;
      this.songCount++;
      _ref = this.songIntervalMessages;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        msg = _ref[_i];
        if (((this.songCount + msg['offset']) % msg['interval']) === 0) {
          _results.push(API.sendChat(msg['msg']));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    settings.prototype.implode = function() {
      var item, val;
      for (item in this) {
        val = this[item];
        if (typeof this[item] === 'object') {
          delete this[item];
        }
      }
      return clearInterval(this.afkInterval);
    };

    return settings;

  })();

  data = new settings();

  User = (function() {
    User.prototype.afkWarningCount = 0;

    User.prototype.lastWarning = null;

    User.prototype["protected"] = false;

    User.prototype.isInRoom = true;

    function User(user) {
      this.user = user;
      this.updateVote = __bind(this.updateVote, this);
      this.inRoom = __bind(this.inRoom, this);
      this.notDj = __bind(this.notDj, this);
      this.warn = __bind(this.warn, this);
      this.getIsDj = __bind(this.getIsDj, this);
      this.getWarningCount = __bind(this.getWarningCount, this);
      this.getUser = __bind(this.getUser, this);
      this.getLastWarning = __bind(this.getLastWarning, this);
      this.getLastActivity = __bind(this.getLastActivity, this);
      this.updateActivity = __bind(this.updateActivity, this);
      this.init = __bind(this.init, this);
      this.init();
    }

    User.prototype.init = function() {
      return this.lastActivity = new Date();
    };

    User.prototype.updateActivity = function() {
      this.lastActivity = new Date();
      this.afkWarningCount = 0;
      return this.lastWarning = null;
    };

    User.prototype.getLastActivity = function() {
      return this.lastActivity;
    };

    User.prototype.getLastWarning = function() {
      if (this.lastWarning === null) {
        return false;
      } else {
        return this.lastWarning;
      }
    };

    User.prototype.getUser = function() {
      return this.user;
    };

    User.prototype.getWarningCount = function() {
      return this.afkWarningCount;
    };

    User.prototype.getIsDj = function() {
      var DJs, dj, _i, _len;
      DJs = API.getWaitList();
      for (_i = 0, _len = DJs.length; _i < _len; _i++) {
        dj = DJs[_i];
        if (this.user.id === dj.id) {
          return true;
        }
      }
      return false;
    };

    User.prototype.warn = function() {
      this.afkWarningCount++;
      return this.lastWarning = new Date();
    };

    User.prototype.notDj = function() {
      this.afkWarningCount = 0;
      return this.lastWarning = null;
    };

    User.prototype.inRoom = function(online) {
      return this.isInRoom = online;
    };

    User.prototype.updateVote = function(v) {
      if (this.isInRoom) {
        return data.voteLog[this.user.id][data.currentsong.id] = v;
      }
    };

    return User;

  })();

  RoomHelper = (function() {
    function RoomHelper() {}

    RoomHelper.prototype.lookupUser = function(username) {
      var id, u, _ref;
      _ref = data.users;
      for (id in _ref) {
        u = _ref[id];
        if (u.getUser().username === username) {
          return u.getUser();
        }
      }
      return false;
    };

    RoomHelper.prototype.userVoteRatio = function(user) {
      var songId, songVotes, vote, votes;
      songVotes = data.voteLog[user.id];
      votes = {
        'woot': 0,
        'meh': 0
      };
      for (songId in songVotes) {
        vote = songVotes[songId];
        if (vote === 1) {
          votes['woot']++;
        } else if (vote === -1) {
          votes['meh']++;
        }
      }
      votes['positiveRatio'] = (votes['woot'] / (votes['woot'] + votes['meh'])).toFixed(2);
      return votes;
    };

    return RoomHelper;

  })();

  populateUserData = function() {
    var u, users, _i, _len;
    users = API.getUsers();
    for (_i = 0, _len = users.length; _i < _len; _i++) {
      u = users[_i];
      data.users[u.id] = new User(u);
      data.voteLog[u.id] = {};
    }
  };

  initEnvironment = function() {
    document.getElementById("woot").click();
    return;
  };

  initialize = function() {
    populateUserData();
    initEnvironment();
    initHooks();
    data.startup();
    data.newSong();
    return data.startAfkInterval();
  };

  afkCheck = function() {
    var DJs, id, lastActivity, lastWarned, now, oneMinute, secsLastActive, timeSinceLastActivity, timeSinceLastWarning, twoMinutes, user, warnMsg, _ref, _results;
    _ref = data.users;
    _results = [];
    for (id in _ref) {
      user = _ref[id];
      now = new Date();
      lastActivity = user.getLastActivity();
      timeSinceLastActivity = now.getTime() - lastActivity.getTime();
      if (timeSinceLastActivity > data.afkTime) {
        if (user.getIsDj()) {
          secsLastActive = timeSinceLastActivity / 1000;
          if (user.getWarningCount() === 0) {
            user.warn();
            _results.push(API.sendChat("@" + user.getUser().username + ", I haven't seen you chat or vote in at least 12 minutes. Are you AFK?  If you don't show activity in 2 minutes I will remove you."));
          } else if (user.getWarningCount() === 1) {
            lastWarned = user.getLastWarning();
            timeSinceLastWarning = now.getTime() - lastWarned.getTime();
            twoMinutes = 2 * 60 * 1000;
            if (timeSinceLastWarning > twoMinutes) {
              user.warn();
              warnMsg = "@" + user.getUser().username;
              warnMsg += ", I haven't seen you chat or vote in at least 14 minutes now.  This is your second and FINAL warning.  If you do not chat or vote in the next minute I will remove you.";
              _results.push(API.sendChat(warnMsg));
            } else {
              _results.push(void 0);
            }
          } else if (user.getWarningCount() === 2) {
            lastWarned = user.getLastWarning();
            timeSinceLastWarning = now.getTime() - lastWarned.getTime();
            oneMinute = 1 * 60 * 1000;
            if (timeSinceLastWarning > oneMinute) {
              DJs = API.getWaitList();
              if (DJs.length > 0 && DJs[0].id !== user.getUser().id) {
                API.sendChat("@" + user.getUser().username + ", you had 2 warnings. Please stay active by chatting or voting.");
                API.moderateRemoveDJ(id);
                _results.push(user.warn());
              } else {
                _results.push(void 0);
              }
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(user.notDj());
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  msToStr = function(msTime) {
    var ms, msg, timeAway;
    msg = '';
    timeAway = {
      'days': 0,
      'hours': 0,
      'minutes': 0,
      'seconds': 0
    };
    ms = {
      'day': 24 * 60 * 60 * 1000,
      'hour': 60 * 60 * 1000,
      'minute': 60 * 1000,
      'second': 1000
    };
    if (msTime > ms['day']) {
      timeAway['days'] = Math.floor(msTime / ms['day']);
      msTime = msTime % ms['day'];
    }
    if (msTime > ms['hour']) {
      timeAway['hours'] = Math.floor(msTime / ms['hour']);
      msTime = msTime % ms['hour'];
    }
    if (msTime > ms['minute']) {
      timeAway['minutes'] = Math.floor(msTime / ms['minute']);
      msTime = msTime % ms['minute'];
    }
    if (msTime > ms['second']) {
      timeAway['seconds'] = Math.floor(msTime / ms['second']);
    }
    if (timeAway['days'] !== 0) {
      msg += timeAway['days'].toString() + 'd';
    }
    if (timeAway['hours'] !== 0) {
      msg += timeAway['hours'].toString() + 'h';
    }
    if (timeAway['minutes'] !== 0) {
      msg += timeAway['minutes'].toString() + 'm';
    }
    if (timeAway['seconds'] !== 0) {
      msg += timeAway['seconds'].toString() + 's';
    }
    if (msg !== '') {
      return msg;
    } else {
      return false;
    }
  };

  Command = (function() {
    function Command(msgData) {
      this.msgData = msgData;
      this.init();
    }

    Command.prototype.init = function() {
      this.parseType = null;
      this.command = null;
      return this.rankPrivelege = null;
    };

    Command.prototype.functionality = function(data) {};

    Command.prototype.hasPrivelege = function() {
      var user;
      user = data.users[this.msgData.fromID].getUser();
      switch (this.rankPrivelege) {
        case 'host':
          return user.permission === 5;
        case 'cohost':
          return user.permission >= 4;
        case 'mod':
          return user.permission >= 3;
        case 'manager':
          return user.permission >= 3;
        case 'bouncer':
          return user.permission >= 2;
        case 'featured':
          return user.permission >= 1;
        default:
          return true;
      }
    };

    Command.prototype.commandMatch = function() {
      var command, msg, _i, _len, _ref;
      msg = this.msgData.message;
      if (typeof this.command === 'string') {
        if (this.parseType === 'exact') {
          if (msg === this.command) {
            return true;
          } else {
            return false;
          }
        } else if (this.parseType === 'startsWith') {
          if (msg.substr(0, this.command.length) === this.command) {
            return true;
          } else {
            return false;
          }
        } else if (this.parseType === 'contains') {
          if (msg.indexOf(this.command) !== -1) {
            return true;
          } else {
            return false;
          }
        }
      } else if (typeof this.command === 'object') {
        _ref = this.command;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          command = _ref[_i];
          if (this.parseType === 'exact') {
            if (msg === command) {
              return true;
            }
          } else if (this.parseType === 'startsWith') {
            if (msg.substr(0, command.length) === command) {
              return true;
            }
          } else if (this.parseType === 'contains') {
            if (msg.indexOf(command) !== -1) {
              return true;
            }
          }
        }
        return false;
      }
    };

    Command.prototype.evalMsg = function() {
      if (this.commandMatch() && this.hasPrivelege()) {
        this.functionality();
        return true;
      } else {
        return false;
      }
    };

    return Command;

  })();

  cookieCommand = (function(_super) {
    __extends(cookieCommand, _super);

    function cookieCommand() {
      _ref = cookieCommand.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    cookieCommand.prototype.init = function() {
      this.command = 'cookie';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'mod';
    };

    cookieCommand.prototype.getCookie = function() {
      var c, cookies;
      cookies = ["a chocolate chip cookie", "a sugar cookie", "an oatmeal raisin cookie", "a 'special' brownie", "an animal cracker", "a scooby snack", "a blueberry muffin", "a cupcake"];
      c = Math.floor(Math.random() * cookies.length);
      return cookies[c];
    };

    cookieCommand.prototype.functionality = function() {
      var msg, r, user;
      msg = this.msgData.message;
      r = new RoomHelper();
      if (msg.substring(7, 8) === "@") {
        user = r.lookupUser(msg.substr(8));
        if (user === false) {
          API.sendChat("/em doesn't see '" + msg.substr(8) + "' in room and eats cookie himself");
          return false;
        } else {
          return API.sendChat("@" + user.username + ", @" + this.msgData.from + " has rewarded you with " + this.getCookie() + ". Enjoy.");
        }
      }
    };

    return cookieCommand;

  })(Command);

  whyWootCommand = (function(_super) {
    __extends(whyWootCommand, _super);

    function whyWootCommand() {
      _ref2 = whyWootCommand.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    whyWootCommand.prototype.init = function() {
      this.command = '!whywoot';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    whyWootCommand.prototype.functionality = function() {
      var msg, nameIndex;
      msg = "We dislike AFK djs. We calculate your AFK status by checking the last time you			Woot'd or spoke. If you don't woot, I'll automagically remove you.";
      if ((nameIndex = this.msgData.message.indexOf('@')) !== -1) {
        return API.sendChat(this.msgData.message.substr(nameIndex) + ', ' + msg);
      } else {
        return API.sendChat(msg);
      }
    };

    return whyWootCommand;

  })(Command);

  themeCommand = (function(_super) {
    __extends(themeCommand, _super);

    function themeCommand() {
      _ref3 = themeCommand.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    themeCommand.prototype.init = function() {
      this.command = '!theme';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    themeCommand.prototype.functionality = function() {
                  var msg;
                  msg = "Besides Classic Rock, we don't have theme's here. Any theme that might be going on is just a spur of the moment thing and completely optional.";
                  return API.sendChat(msg);
    };

    return themeCommand;

  })(Command);

  rulesCommand = (function(_super) {
    __extends(rulesCommand, _super);

    function rulesCommand() {
      _ref4 = rulesCommand.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    rulesCommand.prototype.init = function() {
      this.command = '!rules';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    rulesCommand.prototype.functionality = function() {
      var msg;
      msg = "1) No AFK DJing.  Woot all songs when in the Wait List.";
      API.sendChat(msg);
      msg = "2) No Meh-ing or down voting.";
      API.sendChat(msg);
      msg = "3) 8 minute song limit. Full album plays allowed if the room is slow, there are few DJs or at the moderators discretion. (Ask if you want to play a longer song)";
      API.sendChat(msg);
      msg = "4) NO 90s! We play music from the 50s through the 70s in the Classic Rock/Pop/Funk/Oldies genre. Use this list as an idea:  http://bit.ly/Lkjb4R";
      API.sendChat(msg);
      msg = "5) The pop cutoff is 1979. No 80s electronica/synth/dance pop allowed.";
      API.sendChat(msg);
      msg = "6) Just because you grew up in the 90s doesn't make all music from the 80s Classic. Classic Rock was made from the 50s through the 70s with some albums in the 80s.";
      return API.sendChat(msg);
    };

    return rulesCommand;

  })(Command);

  roomHelpCommand = (function(_super) {
    __extends(roomHelpCommand, _super);

    function roomHelpCommand() {
      _ref5 = roomHelpCommand.__super__.constructor.apply(this, arguments);
      return _ref5;
    }

    roomHelpCommand.prototype.init = function() {
      this.command = '!roomhelp';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    roomHelpCommand.prototype.functionality = function() {
                     var msg1;
                     msg1 = "Welcome to the I <3 Classic Rock room! ";
                     msg1 += "Type '!rules' or read the room description to find out which classic rock music is allowed.";
                     return API.sendChat(msg1);
    };

    return roomHelpCommand;

  })(Command);

  helpCommand = (function(_super) {
    __extends(helpCommand, _super);

    function helpCommand() {
      _ref6 = helpCommand.__super__.constructor.apply(this, arguments);
      return _ref6;
    }

    helpCommand.prototype.init = function() {
      this.command = '!help';
      this.parseType = 'startswith';
      return this.rankPrivelege = 'user';
    };

    helpCommand.prototype.functionality = function() {
      var msg;
      msg = "1) If you don't play classic rock according to the room description, your song will be skipped.";
      API.sendChat(msg);
      msg = "2) If you don't know why your song was skipped, ask why.";
      API.sendChat(msg);
      msg = "3) If you continue to not play classic rock, you will be banned. It is safe to play anything from this list: http://bit.ly/Lkjb4R";
      return API.sendChat(msg);
    };

    return helpCommand;

  })(Command);

  wootCommand = (function(_super) {
    __extends(wootCommand, _super);

    function wootCommand() {
      _ref8 = wootCommand.__super__.constructor.apply(this, arguments);
      return _ref8;
    }

    wootCommand.prototype.init = function() {
      this.command = '!woot';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    wootCommand.prototype.functionality = function() {
      var msg, nameIndex;
      msg = "Please WOOT on DJ Booth and support your fellow DJs! AutoWoot: http://bit.ly/Lwcis0";
      if ((nameIndex = this.msgData.message.indexOf('@')) !== -1) {
        return API.sendChat(this.msgData.message.substr(nameIndex) + ', ' + msg);
      } else {
        return API.sendChat(msg);
      }
    };

    return wootCommand;

  })(Command);

  afksCommand = (function(_super) {
    __extends(afksCommand, _super);

    function afksCommand() {
      _ref11 = afksCommand.__super__.constructor.apply(this, arguments);
      return _ref11;
    }

    afksCommand.prototype.init = function() {
      this.command = '!afks';
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    afksCommand.prototype.functionality = function() {
      var dj, djAfk, djs, msg, now, _i, _len;
      msg = '';
      djs = API.getWaitList();
      for (_i = 0, _len = djs.length; _i < _len; _i++) {
        dj = djs[_i];
        now = new Date();
        djAfk = now.getTime() - data.users[dj.id].getLastActivity().getTime();
        if (djAfk > (5 * 60 * 1000)) {
          if (msToStr(djAfk) !== false) {
            msg += dj.username + ' - ' + msToStr(djAfk);
            msg += '. ';
          }
        }
      }
      if (msg === '') {
        return API.sendChat("No one is AFK");
      } else {
        return API.sendChat('AFKs: ' + msg);
      }
    };

    return afksCommand;

  })(Command);

  allAfksCommand = (function(_super) {
    __extends(allAfksCommand, _super);

    function allAfksCommand() {
      _ref12 = allAfksCommand.__super__.constructor.apply(this, arguments);
      return _ref12;
    }

    allAfksCommand.prototype.init = function() {
      this.command = '!allafks';
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    allAfksCommand.prototype.functionality = function() {
      var msg, now, u, uAfk, usrs, _i, _len;
      msg = '';
      usrs = API.getUsers();
      for (_i = 0, _len = usrs.length; _i < _len; _i++) {
        u = usrs[_i];
        now = new Date();
        uAfk = now.getTime() - data.users[u.id].getLastActivity().getTime();
        if (uAfk > (10 * 60 * 1000)) {
          if (msToStr(uAfk) !== false) {
            msg += u.username + ' - ' + msToStr(uAfk);
            msg += '. ';
          }
        }
      }
      if (msg === '') {
        return API.sendChat("No one is AFK");
      } else {
        return API.sendChat('AFKs: ' + msg);
      }
    };

    return allAfksCommand;

  })(Command);

  statusCommand = (function(_super) {
    __extends(statusCommand, _super);

    function statusCommand() {
      _ref13 = statusCommand.__super__.constructor.apply(this, arguments);
      return _ref13;
    }

    statusCommand.prototype.init = function() {
      this.command = '!status';
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    statusCommand.prototype.functionality = function() {
      var day, hour, launch, lt, meridian, min, month, msg, t, totals;
      lt = data.launchTime;
      month = lt.getMonth() + 1;
      day = lt.getDate();
      hour = lt.getHours();
      meridian = hour % 12 === hour ? 'AM' : 'PM';
      min = lt.getMinutes();
      min = min < 10 ? '0' + min : min;
      t = data.totalVotingData;
      t['songs'] = data.songCount;
      launch = 'Initiated ' + month + '/' + day + ' ' + hour + ':' + min + ' ' + meridian + '. ';
      totals = '' + t.songs + ' songs have been played, accumulating ' + t.woots + ' woots, ' + t.mehs + ' mehs, and ' + t.curates + ' queues.';
      msg = launch + totals;
      return API.sendChat(msg);
    };

    return statusCommand;

  })(Command);

  resetAfkCommand = (function(_super) {
    __extends(resetAfkCommand, _super);

    function resetAfkCommand() {
      _ref22 = resetAfkCommand.__super__.constructor.apply(this, arguments);
      return _ref22;
    }

    resetAfkCommand.prototype.init = function() {
      this.command = '!resetafk';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'mod';
    };

    resetAfkCommand.prototype.functionality = function() {
      var id, name, u, _ref23;
      if (this.msgData.message.length > 10) {
        name = this.msgData.message.substring(11);
        _ref23 = data.users;
        for (id in _ref23) {
          u = _ref23[id];
          if (u.getUser().username === name) {
            u.updateActivity();
            API.sendChat('@' + u.getUser().username + '\'s AFK time has been reset.');
            return;
          }
        }
        API.sendChat('Not sure who ' + name + ' is');
      } else {
        API.sendChat('Yo Gimme a name r-tard');
      }
    };

    return resetAfkCommand;

  })(Command);

  commandsCommand = (function(_super) {
    __extends(commandsCommand, _super);

    function commandsCommand() {
      _ref28 = commandsCommand.__super__.constructor.apply(this, arguments);
      return _ref28;
    }

    commandsCommand.prototype.init = function() {
      this.command = '!commands';
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    commandsCommand.prototype.functionality = function() {
      var allowedUserLevels, c, cc, cmd, msg, user, _i, _j, _len, _len1, _ref29, _ref30;
      allowedUserLevels = [];
      user = API.getUser(this.msgData.fromID);
      window.capturedUser = user;
      if (user.permission > 5) {
        allowedUserLevels = ['user', 'mod', 'host'];
      } else if (user.permission > 2) {
        allowedUserLevels = ['user', 'mod'];
      } else {
        allowedUserLevels = ['user'];
      }
      msg = '';
      for (_i = 0, _len = cmds.length; _i < _len; _i++) {
        cmd = cmds[_i];
        c = new cmd('');
        if (_ref29 = c.rankPrivelege, __indexOf.call(allowedUserLevels, _ref29) >= 0) {
          if (typeof c.command === "string") {
            msg += c.command + ', ';
          } else if (typeof c.command === "object") {
            _ref30 = c.command;
            for (_j = 0, _len1 = _ref30.length; _j < _len1; _j++) {
              cc = _ref30[_j];
              msg += cc + ', ';
            }
          }
        }
      }
      msg = msg.substring(0, msg.length - 2);
      return API.sendChat(msg);
    };

    return commandsCommand;

  })(Command);

  avgVoteRatioCommand = (function(_super) {
    __extends(avgVoteRatioCommand, _super);

    function avgVoteRatioCommand() {
      _ref31 = avgVoteRatioCommand.__super__.constructor.apply(this, arguments);
      return _ref31;
    }

    avgVoteRatioCommand.prototype.init = function() {
      this.command = '!avgvoteratio';
      this.parseType = 'exact';
      return this.rankPrivelege = 'mod';
    };

    avgVoteRatioCommand.prototype.functionality = function() {
      var averageRatio, msg, r, ratio, roomRatios, uid, user, userRatio, votes, _i, _len, _ref32;
      roomRatios = [];
      r = new RoomHelper();
      _ref32 = data.voteLog;
      for (uid in _ref32) {
        votes = _ref32[uid];
        user = data.users[uid].getUser();
        userRatio = r.userVoteRatio(user);
        roomRatios.push(userRatio['positiveRatio']);
      }
      averageRatio = 0.0;
      for (_i = 0, _len = roomRatios.length; _i < _len; _i++) {
        ratio = roomRatios[_i];
        averageRatio += ratio;
      }
      averageRatio = averageRatio / roomRatios.length;
      msg = "Accounting for " + roomRatios.length.toString() + " user ratios, the average room ratio is " + averageRatio.toFixed(2).toString() + ".";
      return API.sendChat(msg);
    };

    return avgVoteRatioCommand;

  })(Command);

  cmds = [afksCommand,allAfksCommand,avgVoteRatioCommand,commandsCommand,cookieCommand,helpCommand,resetAfkCommand,roomHelpCommand,rulesCommand,statusCommand,themeCommand,whyWootCommand,wootCommand];

  chatCommandDispatcher = function(chat) {
    var c, cmd, _i, _len, _results;
    chatUniversals(chat);
    _results = [];
    for (_i = 0, _len = cmds.length; _i < _len; _i++) {
      cmd = cmds[_i];
      c = new cmd(chat);
      if (c.evalMsg()) {
        break;
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  updateVotes = function(obj) {
    data.currentwoots = obj.positive;
    data.currentmehs = obj.negative;
    return data.currentcurates = obj.curates;
  };

  announceCurate = function(obj) {
    return API.sendChat("/em: " + obj.user.username + " loves this song!");
  };

  handleUserJoin = function(user) {
    data.userJoin(user);
    data.users[user.id].updateActivity();
    return API.sendChat("/em: Welcome " + user.username + "!");
  };

  handleNewSong = function(obj) {
    var songId;
    data.intervalMessages();
    if (data.currentsong === null) {
      data.newSong();
    } else {
      
      data.newSong();
      document.getElementById("woot").click();
    }
    API.sendChat("/em: " + API.getDJ().username + " started playing " + data.currentsong.title + " by " + data.currentsong.author + ".");
    if (data.forceSkip) {
      songId = obj.media.id;
      return setTimeout(function() {
        var cMedia;
        cMedia = API.getMedia();
        if (cMedia.id === songId) {
          return API.moderateForceSkip();
        }
      }, obj.media.duration * 1000);
    }
  };

  handleVote = function(obj) {
    data.users[obj.user.id].updateActivity();
    return data.users[obj.user.id].updateVote(obj.vote);
  };

  handleUserLeave = function(user) {
    var disconnectStats, i, u, _i, _len, _ref32;
    disconnectStats = {
      id: user.id,
      time: new Date(),
      songCount: data.songCount
    };
    i = 0;
    _ref32 = data.internalWaitlist;
    for (_i = 0, _len = _ref32.length; _i < _len; _i++) {
      u = _ref32[_i];
      if (u.id === user.id) {
        disconnectStats['waitlistPosition'] = i - 1;
        data.setInternalWaitlist();
        break;
      } else {
        i++;
      }
    }
    data.userDisconnectLog.push(disconnectStats);
    return data.users[user.id].inRoom(false);
  };

  antispam = function(chat) {
    var plugRoomLinkPatt, sender;
    plugRoomLinkPatt = /(\bhttps?:\/\/(www.)?plug\.dj[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    if (plugRoomLinkPatt.exec(chat.message)) {
      sender = API.getUser(chat.fromID);
      if (!sender.ambassador && !sender.moderator && !sender.owner && !sender.superuser) {
        if (!data.users[chat.fromID]["protected"]) {
          //API.sendChat("Don't spam room links you ass clown");
              return ;//API.moderateDeleteChat(chat.chatID);
        } else {
              return ;//API.sendChat("I'm supposed to kick you, but you're just too darn pretty.");
        }
      }
    }
  };

  beggar = function(chat) {
              return;
    var msg, r, responses;
    msg = chat.message.toLowerCase();
    responses = ["Good idea @{beggar}!  Don't earn your fans or anything thats so yesterday", "Guys @{beggar} asked us to fan him!  Lets all totally do it! ಠ_ಠ", "srsly @{beggar}? ಠ_ಠ", "@{beggar}.  Earning his fans the good old fashioned way.  Hard work and elbow grease.  A true american."];
    r = Math.floor(Math.random() * responses.length);
    if (msg.indexOf('fan me') !== -1 || msg.indexOf('fan for fan') !== -1 || msg.indexOf('fan pls') !== -1 || msg.indexOf('fan4fan') !== -1 || msg.indexOf('add me to fan') !== -1) {
      return API.sendChat(responses[r].replace("{beggar}", chat.from));
    }
  };

  chatUniversals = function(chat) {
    data.activity(chat);
    antispam(chat);
    return beggar(chat);
  };

  hook = function(apiEvent, callback) {
    return API.on(apiEvent, callback);
  };

  unhook = function(apiEvent, callback) {
    return API.off(apiEvent, callback);
  };

  apiHooks = [
    {
      'event': API.ROOM_SCORE_UPDATE,
      'callback': updateVotes
    }, {
      'event': API.CURATE_UPDATE,
      'callback': announceCurate
    }, {
      'event': API.USER_JOIN,
      'callback': handleUserJoin
    }, {
      'event': API.DJ_ADVANCE,
      'callback': handleNewSong
    }, {
      'event': API.VOTE_UPDATE,
      'callback': handleVote
    }, {
      'event': API.CHAT,
      'callback': chatCommandDispatcher
    }, {
      'event': API.USER_LEAVE,
      'callback': handleUserLeave
    }
  ];

  initHooks = function() {
    var pair, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = apiHooks.length; _i < _len; _i++) {
      pair = apiHooks[_i];
      _results.push(hook(pair['event'], pair['callback']));
    }
    return _results;
  };

  undoHooks = function() {
    var pair, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = apiHooks.length; _i < _len; _i++) {
      pair = apiHooks[_i];
      _results.push(unhook(pair['event'], pair['callback']));
    }
    return _results;
  };

  initialize();

}).call(this);
