var BrowserID = function(gameTitle, callback) {
    var that = this, loggedIn = false, email = '';
    callback = callback || {};
    gameTitle = gameTitle || 'Unknown Title';
    this.__defineGetter__('loggedIn', function() { return loggedIn; });
    this.__defineGetter__('email', function() { return email; });
    
    var fail = function(res, errback) { loggedIn = false; if (errback) errback(res); };
    var success = function(res, callback) { loggedIn = true; if (callback) callback(res); };
    
    this.setSessions = function(val) {
        if (navigator.id) {
            navigator.id.sessions = val ? val : [ ];
        }
    } 

    this.login = function() {
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
                            success(res, callback);
                        } else 
                            fail(res, errback);
                    },
                    error: function(res, status, xhr) {  
                        fail(res, errback);
                    }
                });
            } else
                fail();
        });
        return loggedIn;
    };

    this.logout = function() {
        $.ajax({
            type: 'POST',
            url: '/api/logout',
            success: function() {
                that.setSessions();
                loggedIn = false;
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
