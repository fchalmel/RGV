/*global  angular:false */
/*jslint sub: true, browser: true, indent: 4, vars: true, nomen: true */
'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('rgv', ['rgv.resources', "ng","ngAnimate",'ngAria', 'ngMaterial', 'ui.grid', 'ui.grid.treeView', 'ui.grid.grouping', 'ui.grid.autoResize', 'ui.grid.selection','angular-carousel', 'ngDialog', 'ngFileUpload', 'ngSanitize', 'ngCookies', 'ngRoute', 'ui.bootstrap', 'ui.tree', 'uuid', 'ngTable','angucomplete-alt']).

config(['$routeProvider','$logProvider',
    function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'views/home.html',
            controller: 'appCtrl'
        });
        $routeProvider.when('/about', {
            templateUrl: 'views/about.html',
            controller: 'noCtrl'
        });
        $routeProvider.when('/contact', {
            templateUrl: 'views/contact.html',
            controller: 'contactCtrl'
        });
        $routeProvider.when('/citing', {
            templateUrl: 'views/citing.html',
            controller: 'noCtrl'
        });
        $routeProvider.when('/funders', {
            templateUrl: 'views/funders.html',
            controller: 'noCtrl'
        });
		$routeProvider.when('/resources', {
            templateUrl: 'views/resources.html',
            controller: 'noCtrl'
        });
		$routeProvider.when('/getinvolved', {
            templateUrl: 'views/getinvolved.html',
            controller: 'noCtrl'
        });
		$routeProvider.when('/technicalcorner', {
            templateUrl: 'views/technicalcorner.html',
            controller: 'noCtrl'
        });
		$routeProvider.when('/news', {
            templateUrl: 'views/news.html',
            controller: 'newsCtrl'
        });
		$routeProvider.when('/statistics', {
            templateUrl: 'views/statistics.html',
            controller: 'noCtrl'
        });
        $routeProvider.when('/download', {
            templateUrl: 'views/download.html',
            controller: 'noCtrl'
        });
        $routeProvider.when('/tutorial', {
            templateUrl: 'views/tutorial.html',
            controller: 'noCtrl'
        });
        $routeProvider.when('/studies', {
            templateUrl: 'views/studies.html',
            controller: 'noCtrl'
        });

        $routeProvider.when('/browser_genome', {
            templateUrl: 'views/browser_genome.html',
            controller: 'noCtrl'
        });
        $routeProvider.when('/browser_genelevel', {
            templateUrl: 'views/browser_genelevel.html',
            controller: 'browsergenelevelCtrl'
        });
        $routeProvider.when('/browser_scRNAseq', {
            templateUrl: 'views/browser_scRNAseq.html',
            controller: 'noCtrl'
        });

		$routeProvider.when('/query', {
            templateUrl: 'views/query.html',
            controller: 'queryCtrl'
        });
        $routeProvider.when('/recover', {
            templateUrl: 'views/recover.html',
            controller: 'recoverCtrl'
        });
        $routeProvider.when('/signin', {
            templateUrl: 'views/signin.html',
            controller: 'signinCtrl'
        });
        $routeProvider.when('/login', {
            templateUrl: 'views/login.html',
            controller: 'loginCtrl'
        });
        $routeProvider.when('/search', {
            templateUrl: 'views/search.html',
            controller: 'searchCtrl'
        });
       $routeProvider.otherwise({
            redirectTo: '/'
        });
}]).

config(['$httpProvider', function ($httpProvider){
    $httpProvider.interceptors.push( function($q, $window){
        return {
            'request': function (config) {
                 config.headers = config.headers || {};
                 if ($window.sessionStorage.token) {
                     config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
                 }
                 return config;
            },
            'response': function(response){
                return response;
            },
            'responseError': function(rejection){
                if(rejection.status == 401) {
                    // Route to #/login
                    location.replace('#/');
                }
                return $q.reject(rejection);
            }
        };
    });
}]);

// Dédié aux pages n'ayant pas besoin de contrôleur (ex que du texte)
angular.module('rgv').controller('userCtrl',
    function ($scope,$rootScope, $log, Auth, User,$location) {
});

// Dédié aux pages n'ayant pas besoin de contrôleur (ex que du texte)
angular.module('rgv').controller('userCtrl',
    function ($scope,$rootScope, $log, Auth, User,$location) {
});


//Page contact avec mail crypté
angular.module('rgv').controller('contactCtrl',
    function ($scope,$rootScope, $log, Auth, User,$location) {
      // Email obfuscator script 2.1 by Tim Williams, University of Arizona
      // Random encryption key feature coded by Andrew Moulden
      // This code is freeware provided these four comment lines remain intact
      // A wizard to generate this code is at http://www.jottings.com/obfuscator/
      //FRED
      var coded = "oVWsWVf0.0AELSWL@fFXWVS.oV";
      var key = "ZF1L2i9xQRYXc8U3AjG4bdEVS5uJzKefwgvOpn0lICk7N6TsMqPthyDHWoarmB";
      var shift=coded.length;
      var  link="";
        for (var i=0; i<coded.length; i++) {
          if (key.indexOf(coded.charAt(i))==-1) {
            var ltr = coded.charAt(i);
            link += (ltr);
          }
          else {
            var ltr = (key.indexOf(coded.charAt(i))-shift+key.length) % key.length;
            link += (key.charAt(ltr));
          }
        }
      document.getElementById("fredmail").innerHTML = "<a class='btn btn-primary btn-twitter btn-sm'  href='mailto:"+link+"'><i class='fa fa-envelope' aria-hidden='true'></i></a>";


      //Olivier
       var coded2 = "m0ZZk4F@KI1k0ImF.k4K";
       var key2 = "WzQNcmYhIRdZSqu3igakJUBOEnDCbAw7rT0HfKGlt5yj61Ms8Lev4pVx2P9XFo";
       var coded2 = "AM55hs9@7nqhMnA9.hs7";
       var key2 = "prZC9jNPfn0ioLMwy3S75sHxav84QqcEhlYDzGUTKAkRXJt6W1BeOIbVu2dFmg";
       var shift2=coded2.length;
       var link2="";
       for (var z=0; z<coded2.length; z++) {
         if (key2.indexOf(coded2.charAt(z))==-1) {
           var ltr2 = coded2.charAt(z);
           link2 += (ltr2);
         }
         else {
           var ltr2 = (key2.indexOf(coded2.charAt(z))-shift2+key2.length) % key2.length;
           link2 += (key2.charAt(ltr2));
         }
       }
       console.log(link2);
      document.getElementById("oliviermail").innerHTML = "<a class='btn btn-primary btn-twitter btn-sm'  href='mailto:"+link2+"'><i class='fa fa-envelope' aria-hidden='true'></i></a>";

});

// Page news - récupère les news du fichiers JSON local
angular.module('rgv').controller('newsCtrl',
    function ($scope,$rootScope, $log, Auth, Dataset, User,$location) {

      //Récupération news from local json file
      Dataset.news_feed().$promise.then(function(news){
        console.log(news);
        if(news.status != 1){
          $scope.newsfeed = news.data["news_list"];
          console.log($scope.newsfeed);
        }
        else {
          $scope.msg = news.msg;
        };
      });

});

angular.module('rgv').directive("chartDiv", function() {
    return {
        scope: {
            chart: "="
        },
        link: function(scope, element, attrs) {
            scope.$watch(attrs.chartDiv, function(value) {
                Plotly.newPlot(attrs.id, scope.chart.data, scope.chart.layout, scope.chart.config || {});
            });
        }
    };
});


angular.module('rgv').controller('browsergenelevelCtrl',
    function ($scope,$rootScope,$http,$filter, Dataset,uiGridConstants, $q, $templateCache) {
        //Get Gene level information

        //Update grid2 en fonction de la selection de la grid1
        $scope.updateSelection = function() {
            console.log("Update");
            $scope.gridApi.grid.refresh();
        };

        //Display block
        $scope.displayStep = function(id){
            $scope.selected_gene =[];

            document.getElementById(id).style.visibility = "visible";
        };

        //GridData (ag-grid) system definition
        $scope.main = {};
        $scope.second = {};
        $scope.filterValue = null;
        $scope.users;
        $scope.chosen = [];
        $scope.selected_gene = [];

        //Checkbox grid template
        $templateCache.put('ui-grid/selectionRowHeaderButtons',
            "<div class=\"ui-grid-selection-row-header-buttons \" ng-class=\"{'ui-grid-row-selected': row.isSelected}\" ><input style=\"margin: 0; vertical-align: middle\" type=\"checkbox\" ng-model=\"row.isSelected\" ng-click=\"row.isSelected=!row.isSelected;selectButtonClick(row, $event)\">&nbsp;</div>"
        );


        $templateCache.put('ui-grid/selectionSelectAllButtons',
            "<div class=\"ui-grid-selection-row-header-buttons \" ng-class=\"{'ui-grid-all-selected': grid.selection.selectAll}\" ng-if=\"grid.options.enableSelectAll\"><input style=\"margin: 0; vertical-align: middle\" type=\"checkbox\" ng-model=\"grid.selection.selectAll\" ng-click=\"grid.selection.selectAll=!grid.selection.selectAll;headerButtonClick($event)\"></div>"
        );

        //liste obj selectionnés
        
        //Species list & tax_id
        $scope.speciesValue = null;
        Dataset.read_file({"name":"species.txt"}).$promise.then(function(dataset){
            $scope.species = []
            for (var i=0;i<dataset.data.line.length;i++){
                var field = dataset.data.line[i].split('|');
                $scope.species.push({'name':field[0],'tax_id':field[1].replace(/[\n]/gi, "" )});
            }
		});
        
        var startPromise = Dataset.data_frame({"name":"studies.txt"}).$promise.then(function(response){
            return $q.when(response)
        })
        startPromise.then(function(value){
            var data_all = value.data;
            $scope.filterD = value.filter;
            //Angular UI-grid
            //Grid One --> Filtre de sélection
            $scope.main.gridOptions.data = value.data_filter;

            // Grid 2 --> All Data
            $scope.second.gridOptions.columnDefs = value.display;
            $scope.second.gridOptions.data = value.data;
        
        });        


        //Angular UI-grid
        //Grid One --> Filtre de sélection
        $scope.selected = {'species':[],'technology':[]};

        //main grid --> Grille gauche: pré-filtre les valeures de la grille droite
        $scope.main.gridOptions = {
            enableRowSelection: true,
            showTreeRowHeader: true,
            enableRowHeaderSelection: true, // Display checkboxes on every row when it's true
            showTreeExpandNoChildren: true, 
            enableGridMenu: false,
            enableColumnMenus: false,
            multiSelect: true,
            columnDefs: [{ name: 'Selection',field:'selection',enableSorting: false ,enableColumnMenu: false, width: '40%' },],
            onRegisterApi: function( gridApi ) {
                $scope.main.gridApi = gridApi;
                $scope.mySelectedRows = $scope.main.gridApi.selection.getSelectedRows();
                gridApi.selection.on.rowSelectionChanged($scope, function(row) {
                if(row.entity.type == 'species'){
                    var index = $scope.selected.species.indexOf(row.entity.selection);
                    if ( index != -1){
                        $scope.selected.species.splice(index,1);
                        $scope.second.gridApi.grid.refresh();
                        
                        
                    } else{
                        $scope.selected.species.push(row.entity.selection);
                        $scope.second.gridApi.grid.refresh();
                        
                    };
                }
                if(row.entity.type == 'technology'){
                    var index = $scope.selected.technology.indexOf(row.entity.selection);
                    if ( index != -1){
                        $scope.selected.technology.splice(index,1);
                        $scope.second.gridApi.grid.refresh();
                        
                        
                    } else{
                        $scope.selected.technology.push(row.entity.selection);
                        $scope.second.gridApi.grid.refresh();
                        
                    };
                }
                    
                });
            }
        };

        var rowsSelected = 0;
        
        //second grid --> Grille droite: informations sur les études en fonctions des filtres selectionnées
        $scope.second.gridOptions = {
            treeRowHeaderAlwaysVisible: true,
            enableGridMenu: false,
            enableSorting: true,
            enableFiltering: true,
            multiSelect: true,
            flatEntityAccess: true,
            showGridFooter: false,
            fastWatch: true,
            onRegisterApi: function( gridoApi ) {
                $scope.second.gridApi = gridoApi;
                $scope.second.gridApi.grid.registerRowsProcessor( $scope.singleFilter, 200 );
                $scope.mySelectedRows = $scope.second.gridApi.selection.getSelectedRows();
                gridoApi.selection.on.rowSelectionChanged($scope, function(row) {
                    var msg = 'row selected ' + row.isSelected;
                    if(row.isSelected){
                        rowsSelected += 1;
                    }
                    if(!row.isSelected){
                        rowsSelected -= 1;
                    }
                    if(rowsSelected <= 5){
                        
                        var index = $scope.chosen.indexOf(row.entity);
                        if ( index != -1){
                            $scope.chosen.splice(index,1);
                            $scope.second.gridApi.grid.refresh();
                        } else{
                            $scope.chosen.push(row.entity);
                            $scope.second.gridApi.grid.refresh();
                        }
                    }else{
                        row.isSelected = false;
                        $scope.msg.push("You can select only 5 studies");
                    }
                });
            }
        };

        //refresh second grid an fonction de la main grid
        $scope.filter = function() {
            $scope.second.gridApi.grid.refresh();
        };

        //Fonction de filtration
        $scope.singleFilter = function( renderableRows ){
            if ($scope.selected.species.length > 0){
                
                renderableRows.forEach( function( row ) {
                
                    // Test si.. en fonction de la selection de la grid 1
                    var match = false;
                    if ($scope.selected.technology.length > 0){
                        if ($scope.selected.species.indexOf(row.entity.Species) > -1 && $scope.selected.technology.indexOf(row.entity.Technology) > -1) {
                            match = true;
                        }
                        if ( !match ){
                            row.visible = false;
                        }
                    }else{
                        if ($scope.selected.species.indexOf(row.entity.Species) > -1) {
                            match = true;
                        }
                        if ( !match ){
                            row.visible = false;
                        }
                    }
                });
                if ($scope.filterValue !=null){
                    var matcher = new RegExp($scope.filterValue);
                    renderableRows.forEach( function( row ) {
                        var match = false;
                        $scope.filterD.forEach(function( field ){
                            if ( row.entity[field].match(matcher) ){
                                match = true;
                            }
                        });
                        if ( !match ){
                            row.visible = false;
                        }
                    });
                    return renderableRows;

                }else{
                    return renderableRows;
                }
            }
            if ($scope.selected.technology.length > 0){
                
                renderableRows.forEach( function( row ) {
                
                    // Test si.. en fonction de la selection de la grid 1
                    var match = false;
                    if ($scope.selected.species.length > 0){
                        if ($scope.selected.species.indexOf(row.entity.Species) > -1 && $scope.selected.technology.indexOf(row.entity.Technology) > -1) {
                            match = true;
                        }
                        if ( !match ){
                            row.visible = false;
                        }
                    }else{
                        if ($scope.selected.technology.indexOf(row.entity.Technology) > -1) {
                            match = true;
                        }
                        if ( !match ){
                            row.visible = false;
                        }
                    }
                });
                if ($scope.filterValue !=null){
                    var matcher = new RegExp($scope.filterValue);
                    renderableRows.forEach( function( row ) {
                        var match = false;
                        $scope.filterD.forEach(function( field ){
                            if ( row.entity[field].match(matcher) ){
                                match = true;
                            }
                        });
                        if ( !match ){
                            row.visible = false;
                        }
                    });
                    return renderableRows;

                }else{
                    return renderableRows;
                }
            }
            else{
                
                renderableRows.forEach( function( row ) {
                    row.visible = true;
                });
                //Check fitration input
                if ($scope.filterValue !=null){
                    var matcher = new RegExp($scope.filterValue);
                    renderableRows.forEach( function( row ) {
                        var match = false;
                        $scope.filterD.forEach(function( field ){
                            if ( row.entity[field].match(matcher) ){
                                match = true;
                            }
                        });
                        if ( !match ){
                            row.visible = false;
                        }
                    });
                    return renderableRows;

                }else{
                    return renderableRows;
                }
            }
        };
        
        $scope.violinPlot = function(data){
            console.log(data);
        }
        //Angular UI-grid END

        //Fonction visualisation gene Level
        $scope.msg = []
        $scope.showGeneLevel = function(selected_lst,selected_gene){
            $scope.msg = [];
            var directory_list = [];
            var genes_list = {};
            for (var i=0;i<selected_lst.length;i++){
                if (selected_lst[i].Directory !=null){
                    directory_list.push(selected_lst[i].Directory);
                }else{
                    $scope.msg.push(" No data available for study: "+selected_lst[i].Study+';');
                }
            }
            for(var z=0;z<selected_gene.length;z++){
                if (selected_gene[z].GeneID !=null){
                    genes_list[selected_gene[z].GeneID] = selected_gene[z].Symbol;
                }
            }
            if(directory_list.length > 0){
                //test
                Dataset.genelevel({},{'directory':directory_list,'conditions':'test','genes':genes_list}).$promise.then(function(response){

                    $scope.time = response.time;
                    $scope.charts = response.charts;
                    console.log($scope.charts);
                });
            }else{
                $scope.msgwrn ="No data available. Please select other studies or contact RGV support.";
                return $scope.msgwrn;
            }
            
        }
        $scope.get_item = function(item, model,label){
            $scope.higlight_gene = item;
         };

        $scope.select_genes = function(selectedgene){
            $scope.msg = []
            var index = $scope.selected_gene.indexOf(selectedgene);
            if ( index != -1){
                $scope.selected_gene.splice(index,1);                           
            } else{
                    $scope.selected_gene.push(selectedgene);     
                }
            if($scope.select_genes.length > 0){
                document.getElementById("step3").style.visibility = "visible"
            }else{
                document.getElementById("step3").style.visibility = "hidden"
            }
        }

        $scope.remove_genes = function(gene){
            var index = $scope.selected_gene.indexOf(gene);
            if ( index != -1){
                $scope.selected_gene.splice(index,1);                              
            };
        }

        $scope.remove_study = function(study){
            var index = $scope.chosen.indexOf(study);
            console.log(study)
            if ( index != -1){
                $scope.chosen.splice(index,1);
            };
        }
        
        $scope.get_genes = function(val,database,species_val) {
            var species_convertor = {};
            return Dataset.autocomplete({},{'database':database,'search':val,'tax_id':species_val}).$promise.then(function(data){
                return data.map(function(item){
                        return item;
                });
            });
        };

                    

        
});


// Contrôleur de base associé à home.html
angular.module('rgv').controller('appCtrl',
    function ($scope,$rootScope, $log, Auth, User, Dataset, $cookieStore, $location) {
        $scope.msg = null;

        // carousel boostrap. Ajouter images et textes dans slides
        $scope.myInterval = 3000;
        $scope.slides = [
          {
            image: 'images/slide1.png',
            text: 'Display your reprogenomics data in RGV',
            id:1
          },
          {
            image: 'images/slide2.png',
            text: 'Convert your own files to use them in RGV',
            id:2
          },
          {
            image: 'images/slide3.jpg',
            text: 'Say: Hello Fred',
            id:3
          },
        ];
        //End carousel

        var user = Auth.getUser();


        //Get Users ip for admin part
        $.getJSON('//freegeoip.net/json/?callback=?', function(data) {
          console.log(JSON.stringify(data, null, 2));
        });


        //Récupération news from local json file
        Dataset.news_feed().$promise.then(function(news){
    			console.log(news);
          if(news.status != 1){
            $scope.newsfeed = news.data["news_list"];
            console.log($scope.newsfeed);
          }
          else {
            $scope.msg = news.msg;
          };
            });
            

        if(user === null || user === undefined) {
            User.is_authenticated({},{}).$promise.then(function(data){
                $rootScope.$broadcast('loginCtrl.login', data);
                Auth.setUser(data);
            });

        }
});

// Dans barre "query" permet de faire une recherche, pas encore implémenté dans RGV
angular.module('rgv').controller('queryCtrl',
    function ($scope,$rootScope, Auth, User, Search, $filter, ngTableParams) {
});

// Faire advanced research
angular.module('rgv').controller('searchCtrl',
    function($scope, $rootScope, $routeParams, $log, $location, $window, User, Auth, SearchHits) {
        var hits = SearchHits.getHits();
        console.log(hits)
        $scope.nb_match = hits.hits.total
        $scope.search_result = hits.hits.hits;
});

// Contrôleur dédié aux fonctions pour se logger
angular.module('rgv').controller('loginCtrl',
    function ($scope, $rootScope, $routeParams, $log, $location, $window, User, Auth, $cookieStore) {
        $scope.msg = null;

      var params = $location.search();

      if(params['action'] !== undefined && params['action'] == 'confirm_email') {
          User.confirm_email({}, {'token': params['token']}).$promise.then(function(data){
              $scope.msg = data['msg'];
          });
      }
      else if(params['token'] !== undefined) {
          User.is_authenticated({},{'token': params['token']}).$promise.then(function(data){
              $rootScope.$broadcast('loginCtrl.login', data);
              Auth.setUser(data);
              $window.sessionStorage.token = params['token'];
              $location.search('token', null);
              $location.path('');
          });
      }

      $scope.remember = function(){
        $cookieStore.put('remember','1');
      }

      $scope.recover = function() {
        User.recover({},{'user_name': $scope.user_name}).$promise.then(function(data){
            $scope.msg = data.msg;
        });
      }

      $scope.login = function() {

          User.login({},{'user_name': $scope.user_name, 'user_password': $scope.user_password}).$promise.then(function(data){
              if(data.token !== undefined){
                 User.is_authenticated({},{'token': data.token}).$promise.then(function(data){
                     $rootScope.$broadcast('loginCtrl.login', data);
                     Auth.setUser(data);
                     $window.sessionStorage.token = data.token;
                     $location.search('token', null);
                     $location.path('');
                 });
              }
              else {
                  $scope.msg = data.msg;
              }
          });
    };
});

// Contrôleur dédié à la registration
angular.module('rgv').controller('signinCtrl',
    function ($scope,$rootScope, $log, Auth, User,$location) {
        $scope.msg = null;

        $scope.register = function(){
        ////console.log("REGISTER");
          if($scope.register_laboratory === null || $scope.register_laboratory == ''){
              $scope.register_laboratory = 'No laboratory';
          }
          if($scope.register_country === null || $scope.register_country == ''){
              $scope.register_country = 'No country';
          }
          if($scope.register_address === null || $scope.register_address == ''){
              $scope.register_address = 'No address';
          }
          if($scope.register_email === null || $scope.register_email == ''){
              $scope.msg = 'User email is empty and must be a valid email address';
          }
          if($scope.register_email === null || $scope.register_email == ''){
              $scope.msg = 'User email is empty and must be a valid email address';
          }
          else if($scope.register_firstname === null || $scope.register_firstname == ''){
              $scope.msg = 'User first name is empty';
          }
          else if($scope.register_lastname === null || $scope.register_lastname == ''){
              $scope.msg = 'User last name is empty';
          }
          else if($scope.register_check_password === null || $scope.register_check_password == '' || $scope.register_check_password != $scope.register_password){
              $scope.msg = 'Passwords do not match';
          }
          else {
              User.register({},{'user_name': $scope.register_email,
                                  'user_password':$scope.register_password,
                                  'first_name': $scope.register_firstname,
                                  'last_name': $scope.register_lastname,
                                  'country':$scope.register_country,
                                  'laboratory': $scope.register_laboratory,
                                  'address': $scope.register_address,
                              }).$promise.then(function(data){
                  $scope.msg = data['msg'];
              });
          }
      }
});

// Contrôleur pour retrouver mot de passe
angular.module('rgv').controller('recoverCtrl',
  function($scope, $rootScope, $routeParams, $log, $location, $window, User, Auth) {
    var params = $location.search();
    $scope.check_password = null;
    $scope.password = null;
    $scope.recover = function(){
        if(params['token'] !== undefined) {
            if($scope.check_password === null || $scope.check_password == '' || $scope.check_password != $scope.password){
                $scope.msg = 'Passwords do not match';
            }
            else {
                User.confirm_recover({},{ 'token': params['token'],'user_password': $scope.password}).$promise.then(function(data){
                    $location.path('/login');
                });
            }
        }
        else {
            $scope.msg = 'Invalid token confirmation';
        }
    };
 });

// Contrôleur pour affichage des informations d'un user
angular.module('rgv').controller('userInfoCtrl',
    function ($scope, $rootScope, $routeParams, $location, Auth, User) {
        $scope.user = null;

        $scope.projects=[];
        $scope.studies=[];
        $scope.signatures=[];
        $scope.assays=[];

        User.get({'uid': $routeParams['id']}).$promise.then(function(data){
            $scope.user = data;
        });

        $scope.update = function() {
            if($scope.user != null) {
                $scope.user.$save({'uid': $routeParams['id']}).then(function(data){
                    $scope.user = data;
                });
            }
        }
      $scope.auth_user = Auth.getUser();

});

// Service (pas contrôleur) d'identification
angular.module('rgv').service('Auth', function() {
    var user =null;
    return {
        getUser: function() {
            return user;
        },
        setUser: function(newUser) {
            user = newUser;
        },
        isConnected: function() {
            return !!user;
        }
    };
});

// Service (pas un contrôleur) pour les recherches
angular.module('rgv').service('SearchHits', function() {
    var hits =null;
    return {
        getHits: function() {
            return hits;
        },
        setHits: function(results) {
            hits = results;
        }
    };
});
