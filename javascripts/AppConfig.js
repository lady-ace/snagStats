'use strict';
let isAuth = (AuthService) => new Promise ((resolve, reject) => {
  if(AuthService.isAuthenticated()){
    resolve();
  } else {
    reject();
  }
});


app.run(function($location, $rootScope, FIREBASE_CONFIG, AuthService, TrackerService){
  firebase.initializeApp(FIREBASE_CONFIG);

//watch method that fires on change of a route.  3 inputs. 
  //event is a change event
  //currRoute is information about your current route
  //prevRoute is information about the route you came from
  $rootScope.$on('$routeChangeStart', function(event, currRoute, prevRoute) {
    // checks to see if there is a cookie with a uid for this app in localstorage
    let logged = AuthService.isAuthenticated();
    let appTo;

    // to keep error from being thrown on page refresh
    if (currRoute.originalPath) {
      // check if the user is going to the auth page = currRoute.originalPath
      // if user is on auth page then appTo is true
      // if it finds something other than /auth it return a -1 and -1!==-1 so resolves to false
      
      // currRoute.originalPath = '/search'   -1 !== -1   appTo = false
      // currRoute.originalPath = '/auth'   0 !== -1   appTo =true
      appTo = currRoute.originalPath.indexOf('/auth') !== -1;
    }

    if (!appTo && !logged) {
      //if not on /auth page AND not logged in redirect to /auth     
      event.preventDefault();
      $rootScope.userLoggedIn = false;
      $location.path('/auth');
    } else if (appTo && !logged){
      //if on /auth page AND not logged in, no redirect only authentiate in navbar
      $rootScope.userLoggedIn = false;
    } else if (appTo && logged){
      //if on /auth page AND logged in, redirect to teamDashboard page
      $rootScope.userLoggedIn = true;
      TrackerService.getSingleTracker(AuthService.getCurrentUid()).then((result) => {
        $location.path(`/teams/${result.teamId}/dashboard`);
      });
    } else if (!appTo && logged){
      //if not on /auth page AND logged in see other navbar
      $rootScope.userLoggedIn = true;
    }
  }); 
});

app.config(function($routeProvider){
  $routeProvider
    .when("/auth", {
      templateUrl: 'partials/auth.html',
      controller: 'AuthCtrl'
    })
    .when('/teams/:teamId/dashboard', {
      templateUrl: 'partials/teamDashboard.html',
      controller: 'TeamViewCtrl',
      resolve: {isAuth}
    })
    .when('/teams/:teamId/games/past', {
      templateUrl: 'partials/gameHistory.html',
      controller: 'GameHistoryCtrl',
      resolve: {isAuth}
    })
    .when('/games/:teamId/insights', {
      templateUrl: 'partials/insightsDashboard.html',
      controller: 'StatsViewCtrl',
      resolve: {isAuth}
    })
    .when('/team/insights/:statTypeId}/stats', {
      templateUrl: 'partials/stats.html',
      controller: 'StatsViewCtrl',
      resolve: {isAuth}
    })

// COACH - CREATING A TEAM:
    .when('/teams/new', {
      templateUrl: 'partials/coachAccess/teamCreateAndEdit.html',
      controller: 'TeamEditCtrl',
      resolve: {isAuth}
    })
    .when('/teams/:teamId/stats/select', {
      templateUrl: 'partials/coachAccess/statSelect.html',
      controller: 'TeamStatCtrl',
      resolve: {isAuth}
    })
    .when('/teams/:teamId/players/new', {
      templateUrl: 'partials/coachAccess/rosterCreateAndEdit.html',
      controller: 'RosterCtrl',
      resolve: {isAuth}
    })
    .when('/teams/:teamId/games/new', {
      templateUrl: 'partials/coachAccess/upcomingGameCreateAndEdit.html',
      controller: 'GameEditCtrl',
      resolve: {isAuth}
    })

// COACH - GAME EDIT, GAME FINALIZE:
    .when('/games/:gameId/edit', {
      templateUrl: 'partials/coachAccess/upcomingGameCreateAndEdit.html',
      controller: 'GameEditCtrl',
      resolve: {isAuth}
    })
    .when('/games/:gameId/final', {
      templateUrl: 'partials/coachAccess/pastGameResolveAndEdit.html',
      controller: 'GameEditCtrl',
      resolve: {isAuth}
    })

// TRACKER ACCESS:
    .when('/trackers/:trackerId/edit', {
      templateUrl: 'partials/trackerAccess/coachSearch.html',
      controller: 'FindCoachCtrl',
      resolve: {isAuth}
    })
// TRACKER - STATS:
    .when('/games/:gameId/stat/select', {
      templateUrl: 'partials/trackerAccess/statSelect.html',
      controller: 'GameStatCtrl',
      resolve: {isAuth}
    })
    .when('/games/stat/:statId/track', {
      templateUrl: 'partials/trackerAccess/statTrack.html',
      controller: 'TrackerCtrl',
      resolve: {isAuth}
    })

    .otherwise('/auth');
});