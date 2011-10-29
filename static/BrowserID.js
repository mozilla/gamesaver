var BrowserID = function(gameTitle, callback) {
    var that = this, loggedIn = false, email = '';
    callback = callback || {};
    gameTitle = gameTitle || 'Unknown Title';
    this.__defineGetter__('loggedIn', function() { return loggedIn; });
    this.__defineGetter__('email', function() { return email; });
    
    var fail = function(res, errback, errback2) { loggedIn = false; if (errback) errback(res);  if (errback2) errback2(res); };
    var success = function(res, callback, callback2) { loggedIn = true; if (callback) callback(res); if (callback2) callback2(res); };
    
    this.setSessions = function(val) {
        if (navigator.id) {
            navigator.id.sessions = val ? val : [ ];
        }
    } 

    this.login = function(callback2, errback2) {
        navigator.id.getVerifiedEmail(function(assertion, callback, errback) {
            var audience = document.domain || 'null';
            if (assertion) {
                $.ajax({
                    type: 'POST',
                    url: '/api/login',
                    data: { assertion: assertion, audience: audience },
                    success: function(res, status, xhr) {
                        if (res) {
                            email = res;
                            success(res, callback, callback2);
                        } else 
                            fail(res, errback, errback2);
                    },
                    error: function(res, status, xhr) {  
                        fail(res, errback, errback2);
                    }
                });
            } else
                fail(null, errback2);
        });
        return loggedIn;
    };

    this.logout = function(callback, errback) {
        $.ajax({
            type: 'POST',
            url: '/api/logout',
            success: function() {
                that.setSessions();
                loggedIn = false;
                if (callback) callback();
            },
            error: function() {
                if (errback) errback();
            }
        });
    };
    
    this.send = function(data, callback, errback) {
        $.ajax({
            type: 'POST',
            url: '/api/set',
            data: { 
	        	data: JSON.stringify(data), 
        		gameTitle: gameTitle 
            },
            dataType: 'json',
            success: function(res, status, xhr) {
            	if (callback) callback(res);
            },
            error: function(res) {
                if (errback) errback(res);
            }
        });
    };
    
    this.receive = function(callback, errback) {
	    $.ajax({
            type: 'GET',
            url: '/api/get',
            data: { gameTitle: gameTitle },
            dataType: 'json',
            success: function(res, status, xhr) {
                if (callback) callback(res);
            },
            error: function(res) {
                if (errback) errback(res);
            }
        });
    };

    this.checkEmpty = function(callback) {
        that.receive(function(res) {
            if (res && JSON.stringify(res.data))
                callback(false);
            else
                callback(true);
        }, function(res) { callback(true); });
    };
    
    (function() {
        $.get('/api/whoami', function (res) {
            if (res) {
                loggedIn = true;
		        email = res;
                if (callback) callback(res);
            }
        }, 'json');
    })();
};
