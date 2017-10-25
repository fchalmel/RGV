/*global  angular:false */
/*jslint sub: true, browser: true, indent: 4, vars: true, nomen: true */
'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('chemsign', ['chemsign.resources','angular-carousel', 'ngDialog', 'ngHandsontable', 'ngTableToCsv', 'ngFileUpload', 'ngSanitize', 'ngCookies', 'angular-js-xlsx', 'ngRoute','angular-venn', 'ui.bootstrap', 'datatables', 'ui.tree', 'uuid', 'ngTable','angucomplete-alt']).

config(['$routeProvider','$logProvider',
    function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'views/home.html',
            controller: 'appCtrl'
        });

        $routeProvider.when('/help', {
            templateUrl: 'views/help.html',
            controller: 'noCtrl'
        });

         $routeProvider.when('/jobresults', {
            templateUrl: 'views/jobresults.html',
            controller: 'jobresultsCtrl'
        });

        $routeProvider.when('/admin', {
            templateUrl: 'views/admin.html',
            controller: 'adminCtrl'
        });

        $routeProvider.when('/query', {
            templateUrl: 'views/query.html',
            controller: 'queryCtrl'
        });

        $routeProvider.when('/about', {
            templateUrl: 'views/about.html',
            controller: 'noCtrl'
        });

        $routeProvider.when('/tools', {
            templateUrl: 'views/tools.html',
            controller: 'noCtrl'
        });

        $routeProvider.when('/jobs', {
            templateUrl: 'views/jobs.html',
            controller: 'jobsCtrl'
        });

        $routeProvider.when('/involved', {
            templateUrl: 'views/involved.html',
            controller: 'noCtrl'
        });

        $routeProvider.when('/recover', {
            templateUrl: 'views/recover.html',
            controller: 'recoverCtrl'
        });

        $routeProvider.when('/ontologies', {
            templateUrl: 'views/ontologies.html',
            controller: 'ontologiesCtrl'
        });

        $routeProvider.when('/compare', {
            templateUrl: 'views/compare.html',
            controller: 'compareCtrl'
        });

        $routeProvider.when('/convert', {
            templateUrl: 'views/convert.html',
            controller: 'convertCtrl'
        });

        $routeProvider.when('/search', {
            templateUrl: 'views/search.html',
            controller: 'searchCtrl'
        });

        $routeProvider.when('/tutorial', {
            templateUrl: 'views/tutorials.html',
            controller: 'noCtrl'
        });

        $routeProvider.when('/downloads', {
            templateUrl: 'views/downloads.html',
            controller: 'noCtrl'
        });

        $routeProvider.when('/browse', {
            templateUrl: 'views/browse.html',
            controller: 'browseCtrl'
        });

        $routeProvider.when('/database', {
            templateUrl: 'views/database.html',
            controller: 'databaseCtrl'
        });

        $routeProvider.when('/predict', {
            templateUrl: 'views/prediction.html',
            controller: 'noCtrl'
        });

         $routeProvider.when('/enrich', {
            templateUrl: 'views/enrich.html',
            controller: 'enrichCtrl'
        });

         $routeProvider.when('/dist', {
            templateUrl: 'views/dist.html',
            controller: 'distCtrl'
        });

        $routeProvider.when('/prio', {
            templateUrl: 'views/prio.html',
            controller: 'noCtrl'
        });

        $routeProvider.when('/signin', {
            templateUrl: 'views/signin.html',
            controller: 'signinCtrl'
        });

        $routeProvider.when('/user/:id', {
            templateUrl: 'views/user.html',
            controller: 'userInfoCtrl'
        });

        $routeProvider.when('/user/:id/myproject', {
            templateUrl: 'views/user_project.html',
            controller: 'userprojectCtrl'
        });

        $routeProvider.when('/user/:id/create_new', {
            templateUrl: 'views/create_new.html',
            controller: 'createCtrl'
        });

        $routeProvider.when('/tutorials/overview', {
            templateUrl: 'tutorial/overview.html',
            controller: 'noCtrl'
        });

         $routeProvider.when('/tutorials/register', {
            templateUrl: 'tutorial/register.html',
            controller: 'noCtrl'
        });

          $routeProvider.when('/tutorials/logging', {
            templateUrl: 'tutorial/logging.html',
            controller: 'noCtrl'
        });

           $routeProvider.when('/tutorials/spreadsheet', {
            templateUrl: 'tutorial/spreadsheet.html',
            controller: 'noCtrl'
        });

        $routeProvider.when('/tutorials/upload', {
            templateUrl: 'tutorial/upload.html',
            controller: 'noCtrl'
        });

        $routeProvider.when('/tutorials/update', {
            templateUrl: 'tutorial/update.html',
            controller: 'noCtrl'
        });

        $routeProvider.when('/tutorials/public', {
            templateUrl: 'tutorial/public.html',
            controller: 'noCtrl'
        });

        $routeProvider.when('/login', {
            templateUrl: 'views/login.html',
            controller: 'loginCtrl'
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
                    ////console.log('Rentre chez toi')
                    location.replace('#/');
                }
                return $q.reject(rejection);
            }
        };
    });
}]);

angular.module('chemsign').controller('noCtrl',
    function ($scope,$rootScope, $log, Auth, User,$location) {

});


angular.module('chemsign').controller('appCtrl',
    function ($scope,$rootScope, $log, Auth, User,$cookieStore, $location,Dataset) {
        $scope.msg = null;

        var user = Auth.getUser();
        if(user !== null && user !== undefined) {
            var cookie_selectID =  $cookieStore.get('selectedID');
           var cookie_jobID =  $cookieStore.get('jobID');
           if (cookie_selectID != undefined && cookie_selectID != ''){
            var user_seletedID = user.selectedID.split(',');
            var cookies_list = cookie_selectID.split(',');
            var job_list = cookie_jobID.split(',');
            
            for(var i=0;i<cookies_list.length; i++){
              var index = user_seletedID.indexOf(cookies_list[i]);
              if (index == -1){
                user_seletedID.push(cookies_list[i]);
              }
            }
            user.selectedID = user_seletedID.join(',');
            user.$save({'uid': user.id}).then(function(data){
                user = data;
                $cookieStore.put('selectedID',null)
            });
           }

           if (cookie_jobID != undefined && cookie_jobID != ''){
              for(var i=0;i < job_list.length; i++){
                var index = user_seletedID.indexOf(job_list[i]);
                if (index > -1){
                  user_seletedID.push(job_list[i]);
                }
              }
              user.jobID = user_seletedID.join(',');
              user.$save({'uid': user.id}).then(function(data){
                  user = data;
                  $cookieStore.put('jobID',null)
              });
           }
           
        }

        if(user === null || user === undefined) {
            User.is_authenticated({},{}).$promise.then(function(data){
                $rootScope.$broadcast('loginCtrl.login', data);
                Auth.setUser(data);
            });

        }


         
        Dataset.get({'filter':'public','from':10000000000,'to': 10000000000000,'collection':'projects','field':'status'}).$promise.then(function(data){
            $scope.last_sign = data.request;
        });

        //INSERT FUNCTION GET LAST
        //Get last updated signature on TOXsIgN

});

angular.module('chemsign').controller('queryCtrl',
    function ($scope,$rootScope, Auth, User, Dataset, Search, $filter, ngTableParams) {
        $scope.selected_type = '';
        $scope.selected_field = {};
        $scope.search_history = [];
        $scope.selected_querymode = {};
        $scope.research = '';
        $scope.query = {};
        $scope.querymode = '';

        $scope.param_add = function() {
          console.log($scope.selected_field);
            if($scope.selected_type == 'projects'){
              var value = '(_type:'+$scope.selected_type+' AND '+$scope.selected_field.projects+':'+$scope.research+')';
            }
            if($scope.selected_type == 'studies'){
              var value = '(_type:'+$scope.selected_type+' AND '+$scope.selected_field.studies+':'+$scope.research+')';
            }
            if($scope.selected_type == 'signatures'){
              var value = '(_type:'+$scope.selected_type+' AND '+$scope.selected_field.signatures+':'+$scope.research+')';
            }
             if($scope.selected_type == 'all'){
              var value = $scope.research;
            }
            console.log(value);
            console.log($scope.selected_field);
            if($scope.selected_querymode.mode == undefined){
              console.log("ADD to dico");
              $scope.query[value] = 'AND';
              $scope.selected_querymode.mode = 'AND';
            }
            else {
              $scope.query[value] = $scope.selected_querymode.mode;
            }
            $scope.selected_type = '';
            $scope.selected_field = {};
            $scope.research = '';

        };

        $scope.search_history_item = function(item) {
            $scope.query = item;
            $scope.search(false);
        }

        $scope.more = function(stepval,filter){
            $scope.max = $scope.max + 100;
            var query_piece = 'status:public ';
            for(var filter in $scope.query){
                query_piece = query_piece +$scope.query[filter]+' '+filter+' '
              //console.log($scope.parameters[i]);
            }
            //console.log(query_piece)
            Search.search_index({"query":query_piece,'from':$scope.max}).$promise.then(function(data){
                $scope.search_results = data;
                $scope.chemicalList = [];
                $scope.check = []
                
                $scope.signatures = []
                $scope.results = $scope.search_results.hits.hits;
                for(var i=0;i<$scope.results.length;i++){
                  var checkd = $scope.signatures.indexOf($scope.results[i]._source);
                  if(checkd === -1) {
                    $scope.signatures.push($scope.results[i]._source);
                  }

                }
                ////console.log($scope.signatures);
                ////console.log($scope.results._source.studies.id);
                ////console.log($scope.results._source.studies[0].id);
            });

        }
        $scope.back = function(stepval,filter){
          $scope.max = $scope.max - 100;
          var query_piece = 'status:public ';
            for(var filter in $scope.query){
                query_piece = query_piece +$scope.query[filter]+' '+filter+' '
              //console.log($scope.parameters[i]);
            }
            //console.log(query_piece)
          Search.search_index({"query":query_piece,'from':$scope.max}).$promise.then(function(data){
                $scope.search_results = data;
                $scope.chemicalList = [];
                $scope.check = []
                
                $scope.signatures = []
                $scope.results = $scope.search_results.hits.hits;
                for(var i=0;i<$scope.results.length;i++){
                  var checkd = $scope.signatures.indexOf($scope.results[i]._source);
                  if(checkd === -1) {
                    $scope.signatures.push($scope.results[i]._source);
                  }

                }
                ////console.log($scope.signatures);
                ////console.log($scope.results._source.studies.id);
                ////console.log($scope.results._source.studies[0].id);
            });

        }



        $scope.convert_timestamp_to_date = function(UNIX_timestamp){
          if(UNIX_timestamp=='' || UNIX_timestamp===null || UNIX_timestamp===undefined) { return '';}
          var a = new Date(UNIX_timestamp*1000);
          var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          var year = a.getFullYear();
          var month = months[a.getMonth()];
          var date = a.getDate();
          var hour = a.getHours();
          var min = a.getMinutes();
          var sec = a.getSeconds();
          var time = date + ',' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
          return time;
        };
        $scope.param_del = function(key) {
            delete $scope.query[key];
        };

        $scope.search_history_item = function(item) {
            $scope.parameters = item;
            $scope.search(false);
        }


        $scope.search = function(do_save) {
            if(do_save) {
                $scope.search_history.push(JSON.parse(JSON.stringify($scope.query)));
            }
            var query_piece = 'status:public ';
            for(var filter in $scope.query){
                query_piece = query_piece +$scope.query[filter]+' '+filter+' '
              //console.log($scope.parameters[i]);
            }
            console.log(query_piece)
            Search.search_index({"query":query_piece,'from':0}).$promise.then(function(data){
                $scope.projects = [];
                $scope.studies = [];
                $scope.assays = [];
                $scope.signatures = [];
                $scope.project_number = 0
                $scope.studies_number = 0
                $scope.assay_number = 0
                $scope.signatures_number = 0
                $scope.search_results = data;
                console.log(data);
                $scope.results = $scope.search_results.hits.hits;
                console.log($scope.results);
                console.log($scope.search_results.hits);

                for(var i =0;i<$scope.results.length;i++){
                  if($scope.results[i]['_type'] == 'projects'){
                    $scope.projects.push($scope.results[i]['_source']);
                    $scope.project_number ++;
                  }
                  if($scope.results[i]['_type'] == 'studies'){
                    $scope.studies.push($scope.results[i]['_source']);
                    $scope.studies_number ++;
                  }
                  if($scope.results[i]['_type'] == 'assays'){
                    $scope.assays.push($scope.results[i]['_source']);
                    $scope.assay_number ++;
                  }
                  if($scope.results[i]['_type'] == 'signatures'){
                    $scope.signatures.push($scope.results[i]['_source']);
                    $scope.signatures_number ++;
                  }

                }
                console.log($scope.results);
            });

        }
});

angular.module('chemsign').controller('searchCtrl',
    function($scope, $rootScope, $routeParams, $log, $location, $window, User, Auth, SearchHits) {
        var hits = SearchHits.getHits();
        console.log(hits)
        $scope.nb_match = hits.hits.total
        $scope.search_result = hits.hits.hits;
        console.log($scope.search_result);
        $scope.projects = [];
        $scope.studies = [];
        $scope.assays = [];
        $scope.signatures = [];
        $scope.project_number = 0
        $scope.studies_number = 0
        $scope.assay_number = 0
        $scope.signatures_number = 0

        for(var i =0;i<$scope.search_result.length;i++){
          if($scope.search_result[i]['_type'] == 'projects'){
            $scope.projects.push($scope.search_result[i]['_source']);
            $scope.project_number ++;
          }
          if($scope.search_result[i]['_type'] == 'studies'){
            $scope.studies.push($scope.search_result[i]['_source']);
            $scope.studies_number ++;
          }
          if($scope.search_result[i]['_type'] == 'assays'){
            $scope.assays.push($scope.search_result[i]['_source']);
            $scope.assay_number ++;
          }
          if($scope.search_result[i]['_type'] == 'signatures'){
            $scope.signatures.push($scope.search_result[i]['_source']);
            $scope.signatures_number ++;
          }

        }

});

angular.module('chemsign').controller('distCtrl',
    function ($scope,$rootScope, $log, Auth, User, Dataset, $window,$cookieStore, $location) {
        $scope.msg = "Dashboard Tools";

        $scope.user = null
        $scope.user = Auth.getUser();

        if($window.sessionStorage.token) {
            $scope.token = $window.sessionStorage.token;
        }

        $scope.signatures = [];
        $scope.selected = ""
        $scope.msg = "Dashboard Tools";
        $scope.filter ="pvalue";
        $scope.adjust_filter ="lt";
        $scope.value_filter =0.01;
        $scope.job_name = "";
        $scope.resultGo="";
        $scope.labels = [];
        $scope.series = [];
        $scope.filter_val = {};
        $scope.size = 0;
        console.log($scope.user);

      $scope.add = function(){
        $scope.filter_val[$scope.filter]={'param':$scope.adjust_filter,'value':$scope.value_filter,'name':$scope.job_name};
        $scope.filter ="pvalue";
        $scope.adjust_filter ="lt";
        $scope.value_filter =0.01;
        $scope.job_name = ""
        $scope.size = Object.keys($scope.filter_val).length;

      };

       $scope.param_del = function(key) {

          delete $scope.filter_val[key];
          $scope.size = Object.keys($scope.filter_val).length;
      };

      if($scope.user == undefined || $scope.user == null){
        $scope.selected = $cookieStore.get('selectedID').split(',');
      }
      else{
        $scope.selected = $scope.user.selectedID.split(',');
        console.log($scope.selected);
      }
      for(var i=0;i<$scope.selected.length;i++){
          console.log($scope.selected[i]);
          console.log(i);
          Dataset.get({'filter':$scope.selected[i],'from':'None','to': 'None','collection':'signatures','field':'id'}).$promise.then(function(data){
            if(data.request != undefined){
              $scope.signatures.push(data.request);
            }
            console.log($scope.signatures);
          });
        }

      $scope.run = function(signature){
        var user_id = "";
        if ($scope.user != null){
          user_id = $scope.user.id;
        }
        else {
          user_id = "None"
        }
        var args =  $scope.filter+','+$scope.adjust_filter+','+$scope.value_filter
        Dataset.run({'uid':user_id, 'signature':signature, 'tool':'distance analysis', 'arguments':args,'name':$scope.job_name}).$promise.then(function(data){
          console.log(data);
          if ($scope.user != null){
            if ($scope.user.jobID == undefined){
              $scope.user.jobID = "";
            }
            var list_jobID = $scope.user.jobID.split(',');
            list_jobID.push(data.id);
            $scope.user.jobID = list_jobID.join(',');
            $scope.user.$save({'uid': $scope.user.id}).then(function(data){
              $scope.user = data;
            });
          }
          else {
            if ($cookieStore.get('jobID') != undefined){
              var list_jobID = $cookieStore.get('jobID').split(',');
            } else{
              var list_jobID = [];
            }
            list_jobID.push(data.id);
            $cookieStore.put('jobID',list_jobID.join(','));
          }
          $location.path('/jobs');;
        });
      }

});


angular.module('chemsign').controller('enrichCtrl',
    function ($scope,$rootScope, $log, Auth, User, Dataset, $location,$window,$cookieStore, ngTableParams, $filter) {
      $scope.msg = "Dashboard Tools";

        $scope.user = null
        $scope.user = Auth.getUser();

        if($window.sessionStorage.token) {
            $scope.token = $window.sessionStorage.token;
        }

        $scope.signatures = [];
        $scope.selected = ""
        $scope.msg = "Dashboard Tools";
        $scope.filter ="pvalue";
        $scope.adjust_filter ="lt";
        $scope.value_filter =0.01;
        $scope.job_name = "";
        $scope.resultGo="";
        $scope.labels = [];
        $scope.series = [];
        $scope.filter_val = {};
        $scope.size = 0;
        console.log($scope.user);

      $scope.add = function(){
        $scope.filter_val[$scope.filter]={'param':$scope.adjust_filter,'value':$scope.value_filter,'name':$scope.job_name};
        $scope.filter ="pvalue";
        $scope.adjust_filter ="lt";
        $scope.value_filter =0.01;
        $scope.job_name = ""
        $scope.size = Object.keys($scope.filter_val).length;

      };

       $scope.param_del = function(key) {

          delete $scope.filter_val[key];
          $scope.size = Object.keys($scope.filter_val).length;
      };

      if($scope.user == undefined || $scope.user == null){
        $scope.selected = $cookieStore.get('selectedID').split(',');
      }
      else{
        $scope.selected = $scope.user.selectedID.split(',');
        console.log($scope.selected);
      }
      for(var i=0;i<$scope.selected.length;i++){
          console.log($scope.selected[i]);
          console.log(i);
          Dataset.get({'filter':$scope.selected[i],'from':'None','to': 'None','collection':'signatures','field':'id'}).$promise.then(function(data){
            if(data.request != undefined){
              $scope.signatures.push(data.request);
            }
            console.log($scope.signatures);
          });
        }

      $scope.run = function(signature){
        var user_id = "";
        if ($scope.user != null){
          user_id = $scope.user.id;
        }
        else {
          user_id = "None"
        }
        var args =  $scope.filter+','+$scope.adjust_filter+','+$scope.value_filter
        Dataset.run({'uid':user_id, 'signature':signature, 'tool':'functional analysis', 'arguments':args,'name':$scope.job_name}).$promise.then(function(data){
          console.log(data);
          if ($scope.user != null){
            if ($scope.user.jobID == undefined){
              $scope.user.jobID = "";
            }
            var list_jobID = $scope.user.jobID.split(',');
            list_jobID.push(data.id);
            $scope.user.jobID = list_jobID.join(',');
            $scope.user.$save({'uid': $scope.user.id}).then(function(data){
              $scope.user = data;
            });
          }
          else {
            if ($cookieStore.get('jobID') != undefined){
              var list_jobID = $cookieStore.get('jobID').split(',');
            } else{
              var list_jobID = [];
            }
            list_jobID.push(data.id);
            $cookieStore.put('jobID',list_jobID.join(','));
          }
          $location.path('/jobs');;
        });
      }

});

angular.module('chemsign').controller('jobresultsCtrl',
    function ($scope,$rootScope, $log, Auth, User, Dataset, $location, ngTableParams, $filter) {

      var params = $location.search();
      Dataset.getjob({'job_list':"",'jid':params['job']}).$promise.then(function(data){
        $scope.job = data.jobs;
        console.log($scope.job);
        Dataset.readresult({'job':$scope.job.id}).$promise.then(function(datas){
          $scope.resultcc = datas.results;
          $scope.Math = window.Math;
          if ($scope.job.tool == 'distance analysis'){
            $scope.conditionTable = new ngTableParams({
              page: 1,
              count: 50,
          },
           {
              total: $scope.resultcc.length,
              getData: function ($defer, params) {
                  $scope.datacc = params.sorting() ? $filter('orderBy')($scope.resultcc, params.orderBy()) : $scope.resultcc;
                  $scope.datacc = params.filter() ? $filter('filter')($scope.datacc, params.filter()) : $scope.datacc;
                  $scope.datacc = $scope.datacc.slice((params.page() - 1) * params.count(), params.page() * params.count());
                  $defer.resolve($scope.datacc);
              }
          });

          }
          if ($scope.job.tool == 'functional analysis'){
            $scope.resultGo = datas.Bp;
                console.log(datas);
                $scope.conditionTable = new ngTableParams({
                    page: 1,
                    count: 50,
                },
                 {
                    total: $scope.resultGo.length,
                    getData: function ($defer, params) {
                        $scope.data = params.sorting() ? $filter('orderBy')($scope.resultGo, params.orderBy()) : $scope.resultGo;
                        $scope.data = params.filter() ? $filter('filter')($scope.data, params.filter()) : $scope.data;
                        $scope.data = $scope.data.slice((params.page() - 1) * params.count(), params.page() * params.count());
                        $defer.resolve($scope.data);
                    }
                });

                $scope.resultMF = datas.Mf;
                $scope.MfTable = new ngTableParams({
                    page: 1,
                    count: 50,
                },
                 {
                    total: $scope.resultMF.length,
                    getData: function ($defer, params) {
                        $scope.datamf = params.sorting() ? $filter('orderBy')($scope.resultMF, params.orderBy()) : $scope.resultMF;
                        $scope.datamf = params.filter() ? $filter('filter')($scope.datamf, params.filter()) : $scope.datamf;
                        $scope.datamf = $scope.datamf.slice((params.page() - 1) * params.count(), params.page() * params.count());
                        $defer.resolve($scope.datamf);
                    }
                });

                $scope.resultcc = datas.Cc;
                $scope.ccTable = new ngTableParams({
                    page: 1,
                    count: 50,
                },
                 {
                    total: $scope.resultcc.length,
                    getData: function ($defer, params) {
                        $scope.datacc = params.sorting() ? $filter('orderBy')($scope.resultcc, params.orderBy()) : $scope.resultcc;
                        $scope.datacc = params.filter() ? $filter('filter')($scope.datacc, params.filter()) : $scope.datacc;
                        $scope.datacc = $scope.datacc.slice((params.page() - 1) * params.count(), params.page() * params.count());
                        $defer.resolve($scope.datacc);
                    }
                });

                $scope.resultds = datas.Disease;
                $scope.dsTable = new ngTableParams({
                    page: 1,
                    count: 50,
                },
                 {
                    total: $scope.resultds.length,
                    getData: function ($defer, params) {
                        $scope.datads = params.sorting() ? $filter('orderBy')($scope.resultds, params.orderBy()) : $scope.resultds;
                        $scope.datads = params.filter() ? $filter('filter')($scope.datads, params.filter()) : $scope.datads;
                        $scope.datads = $scope.datads.slice((params.page() - 1) * params.count(), params.page() * params.count());
                        $defer.resolve($scope.datads);
                    }
                });

          }
          
        });

      });


      $scope.get_Info = function(id){
        Dataset.get({'filter':id,'from':'None','to':'None','collection':'signatures','field':'id'}).$promise.then(function(result){
          var name = "";
          name = result.request.title;
          console.log(name);
          return name;
        });
      }

      $scope.show_dataset = function(id){
        $location.url('/browse?dataset='+id);
      };

      
     

});





angular.module('chemsign').controller('convertCtrl',
    function ($scope,$rootScope, $log, Auth, User, Dataset, $window, $cookieStore, Upload, $location) {
        $scope.user = Auth.getUser();

        $scope.msg = "Dashboard Tools";
        $scope.listID = [];
        $scope.result="";
        $scope.species=0;
        $scope.way = ""

        $scope.user = null
        $scope.user = Auth.getUser();

        if($window.sessionStorage.token) {
            $scope.token = $window.sessionStorage.token;
        }

        $scope.signatures = [];
        $scope.selected = ""

        if($scope.user == undefined || $scope.user == null){
          $scope.selected = $cookieStore.get('selectedID').split(',');
        }
        else{
          $scope.selected = $scope.user.selectedID.split(',');
          console.log($scope.selected);
        }
        console.log($scope.selected);
        for(var i=0;i<$scope.selected.length;i++){
          console.log($scope.selected[i]);
          console.log(i);
          Dataset.get({'filter':$scope.selected[i],'from':'None','to': 'None','collection':'signatures','field':'id'}).$promise.then(function(data){
            $scope.signatures.push(data.request);
            console.log($scope.signatures);
          });
        }


        $scope.deleted = function(signature_id){
          if($scope.user == undefined || $scope.user == null){
            $scope.selected = $cookieStore.get('selectedID').split(',');
            var index = $scope.selected.indexOf(signature_id);
            $scope.selected.splice(index, 1);
            var newcookie = $scope.selected.join(',');
            console.log(newcookie);
            $cookieStore.put('selectedID', newcookie);
          }
          else{
            $scope.selected = $scope.user.selectedID.split(',');
            console.log($scope.selected);
            var index = $scope.selected.indexOf(signature_id);
            $scope.selected.splice(index, 1);
            $scope.user.selectedID = $scope.selected.join(',');
            $scope.user.$save({'uid': $scope.user.id}).then(function(data){
                $scope.user = data;
            });
          }
        }

        $scope.toggleSelection2 = function toggleSelection2(genes) {
            $scope.listID = genes.split(',').join('\n');

        }


        $scope.convert = function(listID,way,species){
          $scope.listID = $scope.listID.split('\n').join(',');
          console.log($scope.listID);
          Dataset.convert({'genes':$scope.listID,'way':$scope.way,'species':$scope.species}).$promise.then(function(data){
            $scope.convertedList = data.converted_list;
            $scope.result = data.converted_list;
          });
        };
});

angular.module('chemsign').controller('jobsCtrl',
    function ($scope,$rootScope, $log, Auth, User,$window, $cookieStore, Dataset, $location, ngDialog) {
        $scope.user = null
        $scope.user = Auth.getUser();


        if($window.sessionStorage.token) {
            $scope.token = $window.sessionStorage.token;
        }

        console.log($scope.user);

        $scope.jobRunning = [];
        $scope.selected = ""

        if($scope.user == undefined || $scope.user == null){
          $scope.jobRunning = $cookieStore.get('jobID').split(',');
        }
        else{
          $scope.jobRunning = $scope.user.jobID.split(',');
          console.log($scope.jobRunning);
        }

        Dataset.getjob({'job_list':$scope.jobRunning}).$promise.then(function(data){
          $scope.jobs = data.jobs;
        });

        $scope.show_info = function(job){
          ngDialog.open({ template: 'lofInfo', scope: $scope, className: 'ngdialog-theme-default',data: job});
        }
        



        $scope.convert_timestamp_to_date = function(UNIX_timestamp){
          if(UNIX_timestamp=='' || UNIX_timestamp===null || UNIX_timestamp===undefined) { return '';}
          var a = new Date(UNIX_timestamp*1000);
          var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          var year = a.getFullYear();
          var month = months[a.getMonth()];
          var date = a.getDate();
          var hour = a.getHours();
          var min = a.getMinutes();
          var sec = a.getSeconds();
          var time = date + ',' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
          return time;
        };

      $scope.show_result = function(job){
        var oid = job._id;
        console.log(oid['$oid']);
        $location.url('/jobresults?job='+oid['$oid']);

      }

      $scope.del_job = function(job){
        if($scope.user == undefined || $scope.user == null){
          var index = $scope.jobRunning.indexOf(job.id)
          if (index != -1){
            $scope.jobRunning.splice(index, 1);
            $cookieStore.put('jobID',$scope.jobRunning.join(','));
            $scope.jobRunning = $cookieStore.get('jobID').split(',');
            Dataset.getjob({'job_list':$scope.jobRunning}).$promise.then(function(data){
                $scope.jobs = data.jobs;
              });
          }
        }
        else{
          var index = $scope.jobRunning.indexOf(job.id.toString());
          if (index != -1){
            $scope.jobRunning.splice(index, 1);
            $scope.user.jobID = $scope.jobRunning.join(',');
            $scope.user.$save({'uid': $scope.user.id}).then(function(data){
              $scope.user = data;
              $scope.jobRunning = $scope.user.jobID.split(',');
               Dataset.getjob({'job_list':$scope.jobRunning}).$promise.then(function(data){
                $scope.jobs = data.jobs;
              });
            });
          }
        }
      }

});



angular.module('chemsign').controller('loginCtrl',
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
    $scope.loginDemo = function() {
          User.login({},{'user_name': 'demo@toxsign.genouest.org', 'user_password':'XaOP13atGK@@13'}).$promise.then(function(data){
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

angular.module('chemsign').controller('signinCtrl',
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




angular.module('chemsign').controller('recoverCtrl',
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

angular.module('chemsign').controller('userInfoCtrl',
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

angular.module('chemsign').controller('userprojectCtrl',
    function ($scope, $rootScope, $routeParams, $location, Auth,Dataset, User) {
        $scope.user = null;
        $scope.pfrom = 0;
        $scope.pto = 25;
        $scope.sfrom = 0;
        $scope.sto = 25;
        $scope.afrom = 0;
        $scope.ato = 25;
        $scope.sgfrom = 0;
        $scope.sgto = 25;


        User.get({'uid': $routeParams['id']}).$promise.then(function(data){
          console.log(data)
          $scope.user = data;
          Dataset.get({'filter':$scope.user.id,'from':$scope.pfrom,'to': $scope.pto,'collection':'projects','field':'owner','all_info':'true'}).$promise.then(function(data){
            $scope.projects = data.request;
            $scope.project_number = data.project_number;
            $scope.studies_number = data.study_number;
            $scope.signatures_number = data.signature_number;
            $scope.assay_number = data.assay_number;
          });
        });
      $scope.auth_user = Auth.getUser();

      

      $scope.test = "";

      $scope.showStudies = function(){
        Dataset.get({'filter':$scope.user.id,'from':$scope.sfrom,'to': $scope.sto,'collection':'studies','field':'owner'}).$promise.then(function(data){
            $scope.studies = data.request;
          });
      };

      $scope.showAssays = function(){
        Dataset.get({'filter':$scope.user.id,'from':$scope.afrom,'to': $scope.ato,'collection':'assays','field':'owner'}).$promise.then(function(data){
            $scope.assays = data.request;
          });
      };

      $scope.showSignatures = function(){
        Dataset.get({'filter':$scope.user.id,'from':$scope.sgfrom,'to': $scope.sgto,'collection':'signatures','field':'owner'}).$promise.then(function(data){
            $scope.signatures = data.request;
          });
      };

      $scope.more = function(type){
        if(type=="projects"){
          console.log($scope.pfrom)
          console.log($scope.pto)
          $scope.pfrom = $scope.pto + 1;
          $scope.pto = $scope.pto + 26;
          console.log($scope.pfrom)
          console.log($scope.pto)
          Dataset.get({'filter':$scope.user.id,'from':$scope.pfrom,'to': $scope.pto,'collection':'projects','field':'owner'}).$promise.then(function(data){
            $scope.projects = data.request;
          });
        };
        if(type=="studies"){
          $scope.sfrom = $scope.sto + 1;
          $scope.sto = $scope.sto + 26;
          Dataset.get({'filter':$scope.user.id,'from':$scope.sfrom,'to': $scope.sto,'collection':'studies','field':'owner'}).$promise.then(function(data){
            $scope.studies = data.request;
          });
        };
        if(type=="assays"){
          $scope.afrom = $scope.ato + 1;
          $scope.ato = $scope.ato + 26;
          Dataset.get({'filter':$scope.user.id,'from':$scope.afrom,'to': $scope.ato,'collection':'assays','field':'owner'}).$promise.then(function(data){
            $scope.assays = data.request;
          });
        };
        if(type=="signatures"){
          $scope.sgfrom = $scope.sgto + 1;
          $scope.sgto = $scope.sgto + 26;
          Dataset.get({'filter':$scope.user.id,'from':$scope.sgfrom,'to': $scope.sgto,'collection':'signatures','field':'owner'}).$promise.then(function(data){
            $scope.signatures = data.request;
          });
        };
      }
      $scope.back = function(type){

        if(type=="projects"){
          $scope.pfrom = $scope.pfrom - 26 ;
          $scope.pto = $scope.pto - 26;
          Dataset.get({'filter':$scope.user.id,'from':$scope.pfrom,'to': $scope.pto,'collection':'projects','field':'owner'}).$promise.then(function(data){
            $scope.projects = data.request;
          });
        };
        if(type=="studies"){
          $scope.sfrom = $scope.sfrom - 26 ;
          $scope.sto = $scope.sto - 26;
          Dataset.get({'filter':$scope.user.id,'from':$scope.sfrom,'to': $scope.sto,'collection':'studies','field':'owner'}).$promise.then(function(data){
            $scope.studies = data.request;
          });
        };
        if(type=="assays"){
          $scope.afrom = $scope.afrom - 26;
          $scope.ato = $scope.ato - 26;
          Dataset.get({'filter':$scope.user.id,'from':$scope.afrom,'to': $scope.ato,'collection':'assays','field':'owner'}).$promise.then(function(data){
            $scope.assays = data.request;
          });
        };
        if(type=="projects"){
          $scope.sgfrom = $scope.sgfrom - 26;
          $scope.sgto = $scope.sgto - 26;
          Dataset.get({'filter':$scope.user.id,'from':$scope.sgfrom,'to': $scope.sgto,'collection':'signatures','field':'owner'}).$promise.then(function(data){
            $scope.signatures = data.request;
          });
        };

      }



});

angular.module('chemsign').controller('compareCtrl',
    function ($scope,$rootScope, $log, Auth, User, Dataset,$cookies,$window, $cookieStore, ngDialog, $location) {
        $scope.msg = "Dashboard Tools";

        $scope.open_info = function(id){
          ngDialog.open({ template: id, className: 'ngdialog-theme-default'});
        }
        $scope.user = null
        $scope.user = Auth.getUser();

        if($window.sessionStorage.token) {
            $scope.token = $window.sessionStorage.token;
        }

        $scope.signatures = [];
        $scope.selected = ""

        if($scope.user == undefined || $scope.user == null){
          $scope.selected = $cookieStore.get('selectedID').split(',');
        }
        else{
          $scope.selected = $scope.user.selectedID.split(',');
          console.log($scope.selected);
        }
        console.log($scope.selected);
        for(var i=0;i<$scope.selected.length;i++){
          console.log($scope.selected[i]);
          console.log(i);
          Dataset.get({'filter':$scope.selected[i],'from':'None','to': 'None','collection':'signatures','field':'id'}).$promise.then(function(data){
            $scope.signatures.push(data.request);
            console.log($scope.signatures);
          });
        }


        $scope.deleted = function(signature_id){
          if($scope.user == undefined || $scope.user == null){
            $scope.selected = $cookieStore.get('selectedID').split(',');
            var index = $scope.selected.indexOf(signature_id);
            $scope.selected.splice(index, 1);
            var newcookie = $scope.selected.join(',');
            console.log(newcookie);
            $cookieStore.put('selectedID', newcookie);
          }
          else{
            $scope.selected = $scope.user.selectedID.split(',');
            console.log($scope.selected);
            var index = $scope.selected.indexOf(signature_id);
            $scope.selected.splice(index, 1);
            $scope.user.selectedID = $scope.selected.join(',');
            $scope.user.$save({'uid': $scope.user.id}).then(function(data){
                $scope.user = data;
            });
          }
        }

        

        $scope.selection = [];
        $scope.posistion = 0
        $scope.list = [{'list':1,'val':" "},{'list':2,'val':" "},{'list':3,'val':" "},{'list':4,'val':" "},{'list':5,'val':" "},{'list':6,'val':" "}]
        
        $scope.toggleSelection2 = function toggleSelection2(names,genes,id) {
          Dataset.convert({'genes':genes,'id':id,'way':'None'}).$promise.then(function(data){
            $scope.convertedList = data.converted_list;
            var name = "";
              name = id+'-'+names;

              var obj = name
              var idx = $scope.selection.indexOf(name);


              // is currently selected
              if (idx > -1) {
                $scope.selection.splice(idx, 1);
                for(var z=0;z<$scope.list.length;z++){
                  if($scope.list[z].val ==name){
                    $scope.list[z].val = " ";
                    document.getElementById('name'+$scope.list[z].list).value = "List"+$scope.list[z].list;
                    document.getElementById('area'+$scope.list[z].list).value = "";
                    break
                  }
                } 
              }

              // is newly selected
              else {
                $scope.selection.push(name);
                for(var z=0;z<$scope.list.length;z++){
                  if($scope.list[z].val ==" "){
                    $scope.list[z].val = name;
                    document.getElementById('name'+$scope.list[z].list).value = name;
                    document.getElementById('area'+$scope.list[z].list).value = $scope.convertedList.join('\n');
                    break
                  }
                } 
              }
          });
        }
});

angular.module('chemsign').controller('createCtrl',
    function ($scope, $rootScope, $routeParams, $location, Dataset, Auth, User,Upload,ngDialog) {
        $scope.user = null;
        $scope.search_result = [];
        $scope.db.items = [
          {
            "id": 1,
            "name": {
              "first": "John",
              "last": "Schmidt"
            },
            "address": "45024 France",
            "price": 760.41,
            "isActive": "Yes",
            "product": {
              "description": "Fried Potatoes",
              "options": [
                {
                  "description": "Fried Potatoes",
                  "image": "//a248.e.akamai.net/assets.github.com/images/icons/emoji/fries.png"
                },
                {
                  "description": "Fried Onions",
                  "image": "//a248.e.akamai.net/assets.github.com/images/icons/emoji/fries.png"
                }
              ]
            }
          },
          {
            "id": 2,
            "name": {
              "first": "John",
              "last": "Schmidt"
            },
            "address": "45024 France",
            "price": 760.41,
            "isActive": "Yes",
            "product": {
              "description": "Fried Potatoes",
              "options": [
                {
                  "description": "Fried Potatoes",
                  "image": "//a248.e.akamai.net/assets.github.com/images/icons/emoji/fries.png"
                },
                {
                  "description": "Fried Onions",
                  "image": "//a248.e.akamai.net/assets.github.com/images/icons/emoji/fries.png"
                }
              ]
            }
          },{
            "id": 3,
            "name": {
              "first": "John",
              "last": "Schmidt"
            },
            "address": "45024 France",
            "price": 760.41,
            "isActive": "Yes",
            "product": {
              "description": "Fried Potatoes",
              "options": [
                {
                  "description": "Fried Potatoes",
                  "image": "//a248.e.akamai.net/assets.github.com/images/icons/emoji/fries.png"
                },
                {
                  "description": "Fried Onions",
                  "image": "//a248.e.akamai.net/assets.github.com/images/icons/emoji/fries.png"
                }
              ]
            }
          },{
            "id": 4,
            "name": {
              "first": "John",
              "last": "Schmidt"
            },
            "address": "45024 France",
            "price": 760.41,
            "isActive": "Yes",
            "product": {
              "description": "Fried Potatoes",
              "options": [
                {
                  "description": "Fried Potatoes",
                  "image": "//a248.e.akamai.net/assets.github.com/images/icons/emoji/fries.png"
                },
                {
                  "description": "Fried Onions",
                  "image": "//a248.e.akamai.net/assets.github.com/images/icons/emoji/fries.png"
                }
              ]
            }
          },
        ]; 


        $scope.get_onto = function() {
        ////console.log(database);
        var database = $scope.db;
        var val = document.getElementById('organism_vivo').value;
        console.log(val);
         Dataset.ontologies({},{'database':database,'search':
          val}).$promise.then(function(data){
            //console.log(data);
             data.map(function(item){
                $scope.search_result = [];
                Object.keys(item).map(function(key, index) {
                    //console.log(item[key]);
                    //console.log(Object.entries(item[key]));
                   $scope.search_result.push(item[key]);
                   //console.log($scope.search_result);
                });
                //     console.log(nitem);
                //     return nitem
                // });
                // item = Object.values(item)
                // console.log(item)
                // return item;
           });
         });
       };
       $scope.selected_tissue = function(item, model,label){
         var toto = item;
         console.log(toto);
      };



        User.get({'uid': $routeParams['id']}).$promise.then(function(data){
            $scope.user = data;
        });
        

      $scope.auth_user = Auth.getUser();

      $scope.upExcel = function (obj){
        console.log(obj);
        ngDialog.open({ template: 'saving', className: 'ngdialog-theme-default'})
        User.project_save({'uid': $scope.user.id, 'file': obj}).$promise.then(function(data){
                alert(data.msg);
                ngDialog.close();
        });
      }


      $scope.openDefault = function () {
        ngDialog.open({
          template: 'firstDialogId',
          className: 'ngdialog-theme-default'
        });
      };
     

      //INSERT FUNCTION UPLOAD EXCEL FILE
      //use user id to upload en read excel file
      $scope.signature_upload = function(excel_file) {
            ////console.log(signature_file);
            var resultInfo={'error':"",'critical':""};
            Upload.upload({
                url: '/upload/'+$scope.user.id+'/excelupload',
                fields: {'uid': $scope.user.id, 'dataset': 'tmp'},
                file: excel_file
            }).progress(function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                ngDialog.open({ template: 'checking', className: 'ngdialog-theme-default'})
                console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
            }).success(function (data, status, headers, config) {
                if(data.status == '0'){
                  console.log('file ' + config.file.name + ' uploaded.');
                  console.log(data.error_assay);
                  resultInfo['error_p'] = data.error_project;
                  resultInfo['error_s'] = data.error_study;
                  resultInfo['error_a'] = data.error_assay;
                  resultInfo['error_f'] = data.error_factor;
                  resultInfo['error_sig'] = data.error_signature;
                  resultInfo['critical'] = data.critical;
                  resultInfo['file'] = data.file;
                  ngDialog.close();
                  ngDialog.open({ template: 'firstDialogId', scope: $scope, className: 'ngdialog-theme-default',data: resultInfo})
                }
                if (data.status == '1'){
                  alert(data.msg);
                }
                
                
            }).error(function (data, status, headers, config) {
                ////console.log('error status: ' + status);
            })
            console.log(resultInfo);
            
      };

      //INSERT PREVALIDATION FILE VISUALISATION
      //show to user a preview of his project and need validation to upload
      //user modal


});


angular.module('chemsign').controller('userCtrl',
  function($scope, $rootScope, $routeParams, $log, $location, $window, User, Auth, Search, SearchHits) {

    $scope.is_logged = false;
    $rootScope.$on('loginCtrl.login', function (event, user) {
      $scope.user = user;
      $scope.is_logged = true;
    });

    $scope.action = 0; // show

    $scope.show_dataset = function(dataset){
      $location.url('/browse?dataset='+dataset.id);
    };


    $scope.dataset_new = function(){
      $location.url('/dataset');
    };

    $scope.convert_timestamp_to_date = function(UNIX_timestamp){
      if(UNIX_timestamp=='' || UNIX_timestamp===null || UNIX_timestamp===undefined) { return '';}
        var a = new Date(UNIX_timestamp*1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date + ',' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
        return time;
      };

    $scope.onSearch = function() {
      Search.search_index({'query': "status:public AND _all:"+$scope.search_sig+'*','from':0}).$promise.then(function(data){
        SearchHits.setHits(data);
        //$rootScope.search_result = data;
        $location.path('/search')
      });
    }

    $scope.email_hash = function(email) {
       var MD5=function(s){function L(k,d){return(k<<d)|(k>>>(32-d))}function K(G,k){var I,d,F,H,x;F=(G&2147483648);H=(k&2147483648);I=(G&1073741824);d=(k&1073741824);x=(G&1073741823)+(k&1073741823);if(I&d){return(x^2147483648^F^H)}if(I|d){if(x&1073741824){return(x^3221225472^F^H)}else{return(x^1073741824^F^H)}}else{return(x^F^H)}}function r(d,F,k){return(d&F)|((~d)&k)}function q(d,F,k){return(d&k)|(F&(~k))}function p(d,F,k){return(d^F^k)}function n(d,F,k){return(F^(d|(~k)))}function u(G,F,aa,Z,k,H,I){G=K(G,K(K(r(F,aa,Z),k),I));return K(L(G,H),F)}function f(G,F,aa,Z,k,H,I){G=K(G,K(K(q(F,aa,Z),k),I));return K(L(G,H),F)}function D(G,F,aa,Z,k,H,I){G=K(G,K(K(p(F,aa,Z),k),I));return K(L(G,H),F)}function t(G,F,aa,Z,k,H,I){G=K(G,K(K(n(F,aa,Z),k),I));return K(L(G,H),F)}function e(G){var Z;var F=G.length;var x=F+8;var k=(x-(x%64))/64;var I=(k+1)*16;var aa=Array(I-1);var d=0;var H=0;while(H<F){Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=(aa[Z]|(G.charCodeAt(H)<<d));H++}Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=aa[Z]|(128<<d);aa[I-2]=F<<3;aa[I-1]=F>>>29;return aa}function B(x){var k="",F="",G,d;for(d=0;d<=3;d++){G=(x>>>(d*8))&255;F="0"+G.toString(16);k=k+F.substr(F.length-2,2)}return k}function J(k){k=k.replace(/rn/g,"n");var d="";for(var F=0;F<k.length;F++){var x=k.charCodeAt(F);if(x<128){d+=String.fromCharCode(x)}else{if((x>127)&&(x<2048)){d+=String.fromCharCode((x>>6)|192);d+=String.fromCharCode((x&63)|128)}else{d+=String.fromCharCode((x>>12)|224);d+=String.fromCharCode(((x>>6)&63)|128);d+=String.fromCharCode((x&63)|128)}}}return d}var C=Array();var P,h,E,v,g,Y,X,W,V;var S=7,Q=12,N=17,M=22;var A=5,z=9,y=14,w=20;var o=4,m=11,l=16,j=23;var U=6,T=10,R=15,O=21;s=J(s);C=e(s);Y=1732584193;X=4023233417;W=2562383102;V=271733878;for(P=0;P<C.length;P+=16){h=Y;E=X;v=W;g=V;Y=u(Y,X,W,V,C[P+0],S,3614090360);V=u(V,Y,X,W,C[P+1],Q,3905402710);W=u(W,V,Y,X,C[P+2],N,606105819);X=u(X,W,V,Y,C[P+3],M,3250441966);Y=u(Y,X,W,V,C[P+4],S,4118548399);V=u(V,Y,X,W,C[P+5],Q,1200080426);W=u(W,V,Y,X,C[P+6],N,2821735955);X=u(X,W,V,Y,C[P+7],M,4249261313);Y=u(Y,X,W,V,C[P+8],S,1770035416);V=u(V,Y,X,W,C[P+9],Q,2336552879);W=u(W,V,Y,X,C[P+10],N,4294925233);X=u(X,W,V,Y,C[P+11],M,2304563134);Y=u(Y,X,W,V,C[P+12],S,1804603682);V=u(V,Y,X,W,C[P+13],Q,4254626195);W=u(W,V,Y,X,C[P+14],N,2792965006);X=u(X,W,V,Y,C[P+15],M,1236535329);Y=f(Y,X,W,V,C[P+1],A,4129170786);V=f(V,Y,X,W,C[P+6],z,3225465664);W=f(W,V,Y,X,C[P+11],y,643717713);X=f(X,W,V,Y,C[P+0],w,3921069994);Y=f(Y,X,W,V,C[P+5],A,3593408605);V=f(V,Y,X,W,C[P+10],z,38016083);W=f(W,V,Y,X,C[P+15],y,3634488961);X=f(X,W,V,Y,C[P+4],w,3889429448);Y=f(Y,X,W,V,C[P+9],A,568446438);V=f(V,Y,X,W,C[P+14],z,3275163606);W=f(W,V,Y,X,C[P+3],y,4107603335);X=f(X,W,V,Y,C[P+8],w,1163531501);Y=f(Y,X,W,V,C[P+13],A,2850285829);V=f(V,Y,X,W,C[P+2],z,4243563512);W=f(W,V,Y,X,C[P+7],y,1735328473);X=f(X,W,V,Y,C[P+12],w,2368359562);Y=D(Y,X,W,V,C[P+5],o,4294588738);V=D(V,Y,X,W,C[P+8],m,2272392833);W=D(W,V,Y,X,C[P+11],l,1839030562);X=D(X,W,V,Y,C[P+14],j,4259657740);Y=D(Y,X,W,V,C[P+1],o,2763975236);V=D(V,Y,X,W,C[P+4],m,1272893353);W=D(W,V,Y,X,C[P+7],l,4139469664);X=D(X,W,V,Y,C[P+10],j,3200236656);Y=D(Y,X,W,V,C[P+13],o,681279174);V=D(V,Y,X,W,C[P+0],m,3936430074);W=D(W,V,Y,X,C[P+3],l,3572445317);X=D(X,W,V,Y,C[P+6],j,76029189);Y=D(Y,X,W,V,C[P+9],o,3654602809);V=D(V,Y,X,W,C[P+12],m,3873151461);W=D(W,V,Y,X,C[P+15],l,530742520);X=D(X,W,V,Y,C[P+2],j,3299628645);Y=t(Y,X,W,V,C[P+0],U,4096336452);V=t(V,Y,X,W,C[P+7],T,1126891415);W=t(W,V,Y,X,C[P+14],R,2878612391);X=t(X,W,V,Y,C[P+5],O,4237533241);Y=t(Y,X,W,V,C[P+12],U,1700485571);V=t(V,Y,X,W,C[P+3],T,2399980690);W=t(W,V,Y,X,C[P+10],R,4293915773);X=t(X,W,V,Y,C[P+1],O,2240044497);Y=t(Y,X,W,V,C[P+8],U,1873313359);V=t(V,Y,X,W,C[P+15],T,4264355552);W=t(W,V,Y,X,C[P+6],R,2734768916);X=t(X,W,V,Y,C[P+13],O,1309151649);Y=t(Y,X,W,V,C[P+4],U,4149444226);V=t(V,Y,X,W,C[P+11],T,3174756917);W=t(W,V,Y,X,C[P+2],R,718787259);X=t(X,W,V,Y,C[P+9],O,3951481745);Y=K(Y,h);X=K(X,E);W=K(W,v);V=K(V,g)}var i=B(Y)+B(X)+B(W)+B(V);return i.toLowerCase()};
       return MD5(email);
    };
    /*
    User.is_authenticated().$promise.then(function(data) {
        if(data.user !== null) {
         $scope.user = data.user;
         $scope.user['is_admin'] = data.is_admin;
         $scope.is_logged = true;
         Auth.setUser($scope.user);
       }
    });
    */

    $scope.logout = function() {
        $scope.user = null;
        $scope.is_logged = false;
        Auth.setUser(null);
        delete $window.sessionStorage.token;
        $location.path('/');
    };

});

angular.module('chemsign').controller('browseCtrl',
  function($scope, $rootScope, $routeParams, $log,$cookies, $cookieStore, $location, $window, Dataset, User, Upload, Auth, ngDialog) {
      //$scope.list = [{'title': 'test1', 'items': [{'title': 'subtest1'},{'title': 'subtest2'}]}];
      $scope.user = Auth.getUser();

      if($window.sessionStorage.token) {
          $scope.token = $window.sessionStorage.token;
      }

      $scope.collaborator = null;
      $scope.location = location.host;
      $scope.urlabs = $location.absUrl();
      var nodes = new vis.DataSet();
      var edges = new vis.DataSet();
      var network;

      var options = {
        layout: {
          randomSeed: undefined,
          improvedLayout:true,
          hierarchical: {
            enabled:true,
            levelSeparation: 150,
            nodeSpacing: 100,
            treeSpacing: 200,
            blockShifting: true,
            edgeMinimization: true,
            parentCentralization: true,
            direction: 'UD',        // UD, DU, LR, RL
            sortMethod: 'hubsize'   // hubsize, directed
          }
        }
      };
      $scope.factors = [];
      $scope.assay={}

      var container = document.getElementById('mynetwork');
      


      var params = $location.search();
      ////console.log(params);
      if(params['dataset'] !== undefined) {
        $scope.collection = "";
        if (params['dataset'].includes("TSE")){
          $scope.collection = 'studies';
        };
        if (params['dataset'].includes("TSP")){
          $scope.collection = 'projects';
        };
        if (params['dataset'].includes("TSA")){
          $scope.collection = 'assays';
        };
        if (params['dataset'].includes("TSS")){
          $scope.collection = 'signatures';
        };

        Dataset.get({'filter':params['dataset'],'from':'None','to':'None','collection':$scope.collection,'field':'id'}).$promise.then(function(data){
          $scope.data = data.request;
          
          if($scope.data.status != 'public' && ($scope.user == undefined || $scope.user.id != $scope.data.owner )){
            console.log($scope.data.status);
            console.log($scope.data.owner);
            console.log($scope.user);
            $scope.data = {};
            $scope.data['id'] = 'ERROR';
            $scope.data['title'] = 'You are not authorized to access this resource'
            return $scope.data
          }
          Dataset.get({'filter':$scope.data.owner,'from':'None','to':'None','collection':'users','field':'id'}).$promise.then(function(result){
              $scope.owner = result.request;
          });
         
          if($scope.collection == 'studies'){
            document.getElementById('mynetwork').style.display = "none";
            console.log($scope.data);

            //Get info on project/studies and owner
            Dataset.get({'filter':$scope.data.projects,'from':'None','to':'None','collection':'projects','field':'id'}).$promise.then(function(result){
              $scope.info_project = result.request.title;
            });
            

            $scope.data.assays = $scope.data.assays.split(',');
            $scope.data.signatures = $scope.data.signatures.split(',');
            if($scope.data.warnings != undefined){
              $scope.data.warnings = $scope.data.warnings.split(',');
            }
            if($scope.data.info != undefined){
              $scope.data.info = $scope.data.info.split(',');
            }
            if($scope.data.critical != undefined){
              $scope.data.critical = $scope.data.critical.split(',');
            }

          };

          if($scope.collection == 'assays'){
            document.getElementById('mynetwork').style.display = "none";
            console.log($scope.data);

            Dataset.get({'filter':$scope.data.projects,'from':'None','to':'None','collection':'projects','field':'id'}).$promise.then(function(result){
              $scope.info_project = result.request.title;
            });

            Dataset.get({'filter':$scope.data.studies,'from':'None','to':'None','collection':'studies','field':'id'}).$promise.then(function(result){
              $scope.info_study = result.request.title;
            });

            $scope.data.signatures = $scope.data.signatures.split(',');

            if($scope.data.warnings != undefined){
              $scope.data.warnings = $scope.data.warnings.split(',');
            }
            if($scope.data.info != undefined){
              $scope.data.info = $scope.data.info.split(',');
            }
            if($scope.data.critical != undefined){
              $scope.data.critical = $scope.data.critical.split(',');
            }
            
            $scope.data.factors = $scope.data.factors.split(',');
            for(var i=0;i < $scope.data.factors.length; i++){
              console.log($scope.data.factors[i]);
              var id_factor = $scope.data.factors[i];
              Dataset.get({'filter':id_factor,'from':'None','to':'None','collection':'factors','field':'id'}).$promise.then(function(data){
                $scope.factors.push(data.request);
              });

            }
          };

          if($scope.collection == 'signatures'){
            console.log($scope.data);

            Dataset.get({'filter':$scope.data.projects,'from':'None','to':'None','collection':'projects','field':'id'}).$promise.then(function(result){
              $scope.info_project = result.request.title;
            });
            
            Dataset.get({'filter':$scope.data.studies,'from':'None','to':'None','collection':'studies','field':'id'}).$promise.then(function(result){
              $scope.info_study = result.request.title;
            });

            if($scope.data.warnings != undefined){
              $scope.data.warnings = $scope.data.warnings.split(',');
            }
            if($scope.data.info != undefined){
              $scope.data.info = $scope.data.info.split(',');
            }
            if($scope.data.critical != undefined){
              $scope.data.critical = $scope.data.critical.split(',');
            }

            document.getElementById('mynetwork').style.display = "none";
            $scope.data.studies = $scope.data.studies.split(',');
            $scope.data.assays = $scope.data.assays.split(',');
            for(var z=0;z<$scope.data.assays.length;z++){
              Dataset.get({'filter':$scope.data.assays[z],'from':'None','to':'None','collection':'assays','field':'id'}).$promise.then(function(data){
                $scope.assays = data.request;
                $scope.assays.factors = $scope.assays.factors.split(',');
                for(var i=0;i < $scope.assays.factors.length; i++){
                  console.log($scope.assays.factors[i]);
                  var id_factor = $scope.assays.factors[i];
                  Dataset.get({'filter':id_factor,'from':'None','to':'None','collection':'factors','field':'id'}).$promise.then(function(data){
                    $scope.factors.push(data.request);
                  });

                }
              });
            }
          };

          //Network project
          if($scope.collection == 'projects'){
            //Init edge/node variable
            $scope.data.pubmed = $scope.data.pubmed.split(',')
            $scope.data.contributor = $scope.data.contributor.split(',')
            if($scope.data.warnings != undefined){
              $scope.data.warnings = $scope.data.warnings.split(',');
            }
            if($scope.data.info != undefined){
              $scope.data.info = $scope.data.info.split(',');
            }
            if($scope.data.critical != undefined){
              $scope.data.critical = $scope.data.critical.split(',');
            }

            var nodeId = 1
            var nodeObj = {};
            var nodeProject = [];
            var edgeProject = [];
            var selectedNode;
            var selecteddata;

            data.request.studies = data.request.studies.split(',')
            data.request.signatures =  data.request.signatures.split(',')
            data.request.assays =  data.request.assays.split(',')
            //init root as project
            nodeObj[data.request.id] = nodeId;
            nodeProject.push({'id':nodeId,'label':data.request.id,'shape':'box','level':1})

            //Create node + node index
            for(var index in data.request.studies){
              nodeId ++;
              var obj = data.request.studies[index];
              nodeObj[obj] = nodeId;
              nodeProject.push({'id':nodeId,'label':obj,'shape':'circle','color':'#93c54b','level':2})
            }
            for(var index in data.request.signatures){
              nodeId ++;
              var obj = data.request.signatures[index];
              nodeObj[obj] = nodeId;
              nodeProject.push({'id':nodeId,'label':obj,'shape':'database','color':'#d9534f','level':4})
            }
            for(var index in data.request.assays){
              nodeId ++;
              var obj = data.request.assays[index];
              nodeObj[obj] = nodeId;
              nodeProject.push({'id':nodeId,'label':obj,'shape':'triangle','color':'grey','level':3})
            }

            //Create edges from root
            for(var index in data.request.studies){
              var obj = data.request.studies[index];
              var from = 1;
              var to = nodeObj[obj];
              edgeProject.push({'from':from,'to':to})
            }

            //create all remining edges
            for(var index in data.request.edges){
              var from = nodeObj[index];
              for(var asso in data.request.edges[index]){
                var to = nodeObj[data.request.edges[index][asso]];
                edgeProject.push({'from':from,'to':to})
              }
              //var from = 1;
              //var to = nodeObj[obj];
              //edgeProject.push({'from':from,'to':to})
            }


            // create an array with nodes
            nodes.add(nodeProject);

            // create an array with edges
            edges.add(edgeProject);

            // create a network

            // provide the data in the vis format
            var datanet = {
                nodes: nodes,
                edges: edges
            };
            
            network = new vis.Network(container, datanet, options);
            

            // initialize your network!
            
            network.on( 'click', function(properties) {
                var ids = properties.nodes;
                var clickedNodes = nodes.get(ids);
                selectedNode = clickedNodes[0]['label'];
                document.getElementById('information').innerHTML = selectedNode;
                document.getElementById('viewinfo').style.display = "inline";
            });
          } //End network project
        });
      }
      $scope.showInfo = function(){
        var dataset = document.getElementById('information').innerHTML;
        $location.url('/browse?dataset='+dataset);
      }
      $scope.display = function(id){
        $location.url('/browse?dataset='+id);
      }


      $scope.getProject = function (id){
        Dataset.download({'uid':$scope.user.id,'id':id}).$promise.then(function(data){
          if(data['msg']){
            $scope.msg = data['msg'];
            return false
          }
          //var link = document.createElement("a");
          //console.log(data['url'])
          //link.href = data['url'];
          //link.click();
        });
      };

      $scope.addToWorkspace = function(id){
        if ($scope.user != null && $scope.user != undefined ){
            var selectedID = $scope.user.selectedID
            if (selectedID.split(',').indexOf(id) == -1){
              if (selectedID == "" || selectedID == undefined){
                selectedID = id;
                $scope.user.selectedID = selectedID;
              }
              else {
                selectedID = selectedID+','+id;
                $scope.user.selectedID = selectedID;
              }
      
            }
            
            $scope.user.$update({'uid': $scope.user.id}).then(function(data){
                    $scope.user = data;
                    console.log(data);
            });
        }
        else {
          $cookieStore.put('selectedID', id);
        }
      }

      $scope.file_upload = function(file,type) {
            console.log(file);
            Upload.upload({
                url: '/upload/'+$scope.user.id+'/'+$scope.data.id+'/file_upload',
                fields: {'uid': $scope.user.id, 'dataset': $scope.data.projects,'type':type, 'name':file.name, 'sid':$scope.data.id},
                file: file
            }).progress(function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
            }).success(function (data, status, headers, config) {
                console.log('file ' + config.file.name + ' uploaded.');
                alert(data.msg);


            }).error(function (data, status, headers, config) {
                console.log('error status: ' + status);
                alert(data.msg)
            })
            
      };

      $scope.signature_upload = function(excel_file,pid) {
            ////console.log(signature_file);
            var resultInfo={'error':"",'critical':""};
            Upload.upload({
                url: '/upload/'+$scope.user.id+'/excelupload',
                fields: {'uid': $scope.user.id, 'dataset': 'tmp'},
                file: excel_file
            }).progress(function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                //document.getElementById("bgimg").style.display = "block";
                console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                ngDialog.open({ template: 'checking', className: 'ngdialog-theme-default'})
            }).success(function (data, status, headers, config) {
                if (data.status == "0"){
                  console.log('file ' + config.file.name + ' uploaded.');
                  console.log(data.error_assay);
                  resultInfo['error_p'] = data.error_project;
                  resultInfo['error_s'] = data.error_study;
                  resultInfo['error_a'] = data.error_assay;
                  resultInfo['error_f'] = data.error_factor;
                  resultInfo['error_sig'] = data.error_signature;
                  resultInfo['critical'] = data.critical;
                  resultInfo['file'] = data.file;
                  resultInfo['pid'] = pid;
                  ngDialog.close();
                  ngDialog.open({ template: 'firstDialogId', scope: $scope, className: 'ngdialog-theme-default',data: resultInfo})
                }
                if (data.status == '1'){
                  alert(data.msg);
                }
                //document.getElementById("bgimg").style.display = "none";
            }).error(function (data, status, headers, config) {
                ////console.log('error status: ' + status);
            })
            console.log(resultInfo);
            
      };
      $scope.upExcel = function (obj,pid){
        console.log(obj);
        ngDialog.open({ template: 'saving', className: 'ngdialog-theme-default'})
        User.update({'uid': $scope.user.id, 'file': obj, 'pid' : pid}).$promise.then(function(data){
                alert(data.msg);
                ngDialog.close();
        });
      }

      $scope.convert_timestamp_to_date = function(UNIX_timestamp){
          if(UNIX_timestamp=='' || UNIX_timestamp===null || UNIX_timestamp===undefined) { return '';}
          var a = new Date(UNIX_timestamp*1000);
          var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          var year = a.getFullYear();
          var month = months[a.getMonth()];
          var date = a.getDate();
          var hour = a.getHours();
          var min = a.getMinutes();
          var sec = a.getSeconds();
          var time = date + ',' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
          return time;
        }

      $scope.switch = function(project){
        var r = confirm("You are about to make your project public.");
        if (r == true) {
            Dataset.pending({'project':project}).$promise.then(function(data){
              alert(data.msg);
            });
        }
      }

      

      $scope.can_edit = function() {
          if ($scope.user === null){
            return false;
          };
          if($scope.dataset !== undefined && $scope.user !== undefined) {
            if($scope.dataset.status != "private") {
                return false;
            }
            if($scope.dataset.owner == $scope.user.id) {
                return true;
            }
            if($scope.dataset.collaborators.indexOf($scope.user.id)>=0) {
                return true;
            }
            if($scope.user['admin'] !== undefined && $scope.user['admin']) {
                return true;
            }
          }
          else {
              return false;
          }
      }
});

angular.module('chemsign').controller('databaseCtrl',
  function($scope, $rootScope, $routeParams, $log, $location, $window, User, Dataset, Auth, ngDialog, $filter, ngTableParams) {
      //$scope.list = [{'title': 'test1', 'items': [{'title': 'subtest1'},{'title': 'subtest2'}]}];
      $scope.user = Auth.getUser();
      if($window.sessionStorage.token) {
          $scope.token = $window.sessionStorage.token;
      }
      $scope.collaborator = null;
      $scope.location = location.host;
      $scope.pfrom = 0;
      $scope.pto = 25;
      $scope.sfrom = 0;
      $scope.sto = 25;
      $scope.afrom = 0;
      $scope.ato = 25;
      $scope.sgfrom = 0;
      $scope.sgto = 25;

      Dataset.get({'filter':'public','from':$scope.pfrom,'to': $scope.pto,'collection':'projects','field':'status','all_info':'true'}).$promise.then(function(data){
        $scope.projects = data.request;
        $scope.project_number = data.project_number;
        $scope.studies_number = data.study_number;
        $scope.signatures_number = data.signature_number;
        $scope.assay_number = data.assay_number;
      });



      $scope.showStudies = function(){
        Dataset.get({'filter':'public','from':$scope.sfrom,'to': $scope.sto,'collection':'studies','field':'status'}).$promise.then(function(data){
            $scope.studies = data.request;
          });
      };

      $scope.showAssays = function(){
        Dataset.get({'filter':'public','from':$scope.afrom,'to': $scope.ato,'collection':'assays','field':'status'}).$promise.then(function(data){
            $scope.assays = data.request;
          });
      };

      $scope.showSignatures = function(){
        Dataset.get({'filter':'public','from':$scope.sgfrom,'to': $scope.sgto,'collection':'signatures','field':'status'}).$promise.then(function(data){
            $scope.signatures = data.request;
          });
      };

      $scope.more = function(type){
        if(type=="projects"){
          console.log($scope.pfrom)
          console.log($scope.pto)
          $scope.pfrom = $scope.pto + 1;
          $scope.pto = $scope.pto + 26;
          console.log($scope.pfrom)
          console.log($scope.pto)
          Dataset.get({'filter':'public','from':$scope.pfrom,'to': $scope.pto,'collection':'projects','field':'status'}).$promise.then(function(data){
            $scope.projects = data.request;
          });
        };
        if(type=="studies"){
          $scope.sfrom = $scope.sto + 1;
          $scope.sto = $scope.sto + 26;
          Dataset.get({'filter':'public','from':$scope.sfrom,'to': $scope.sto,'collection':'studies','field':'status'}).$promise.then(function(data){
            $scope.studies = data.request;
          });
        };
        if(type=="assays"){
          $scope.afrom = $scope.ato + 1;
          $scope.ato = $scope.ato + 26;
          Dataset.get({'filter':'public','from':$scope.afrom,'to': $scope.ato,'collection':'assays','field':'status'}).$promise.then(function(data){
            $scope.assays = data.request;
          });
        };
        if(type=="signatures"){
          $scope.sgfrom = $scope.sgto + 1;
          $scope.sgto = $scope.sgto + 26;
          Dataset.get({'filter':'public','from':$scope.sgfrom,'to': $scope.sgto,'collection':'signatures','field':'status'}).$promise.then(function(data){
            $scope.signatures = data.request;
          });
        };
      }
      $scope.back = function(type){

        if(type=="projects"){
          $scope.pfrom = $scope.pfrom - 26 ;
          $scope.pto = $scope.pto - 26;
          Dataset.get({'filter':'public','from':$scope.pfrom,'to': $scope.pto,'collection':'projects','field':'status'}).$promise.then(function(data){
            $scope.projects = data.request;
          });
        };
        if(type=="studies"){
          $scope.sfrom = $scope.sfrom - 26 ;
          $scope.sto = $scope.sto - 26;
          Dataset.get({'filter':'public','from':$scope.sfrom,'to': $scope.sto,'collection':'studies','field':'status'}).$promise.then(function(data){
            $scope.studies = data.request;
          });
        };
        if(type=="assays"){
          $scope.afrom = $scope.afrom - 26;
          $scope.ato = $scope.ato - 26;
          Dataset.get({'filter':'public','from':$scope.afrom,'to': $scope.ato,'collection':'assays','field':'status'}).$promise.then(function(data){
            $scope.assays = data.request;
          });
        };
        if(type=="signatures"){
          $scope.sgfrom = $scope.sgfrom - 26;
          $scope.sgto = $scope.sgto - 26;
          Dataset.get({'filter':'public','from':$scope.sgfrom,'to': $scope.sgto,'collection':'signatures','field':'status'}).$promise.then(function(data){
            $scope.signatures = data.request;
          });
        };

      }


      $scope.convert_timestamp_to_date = function(UNIX_timestamp){
          if(UNIX_timestamp=='' || UNIX_timestamp===null || UNIX_timestamp===undefined) { return '';}
          var a = new Date(UNIX_timestamp*1000);
          var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          var year = a.getFullYear();
          var month = months[a.getMonth()];
          var date = a.getDate();
          var hour = a.getHours();
          var min = a.getMinutes();
          var sec = a.getSeconds();
          var time = date + ',' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
          return time;
        };

      $scope.open_info = function(id){
        ngDialog.open({ template: id, className: 'ngdialog-theme-default'});
      }    

});

angular.module('chemsign').controller('ontologiesCtrl',
    function ($scope,$rootScope, $log, Auth, User, Dataset, $location) {
      $scope.msg = "Dashboard Tools";
      $scope.selected_organism = 'none';
      console.log($scope.selected_organism);

      $scope.get_onto = function(val,database) {
        ////console.log(database);
        return Dataset.ontologies({},{'database':database,'search':
          val}).$promise.then(function(data){
            console.log(data)
            return data.map(function(item){
                console.log(item)
                 return item;
           });
         });
       };

      $scope.selected_tissue = function(item, model,label){
         $scope.tissue = item;
         document.getElementById('result_tissue').style.display = "block";
      };

      $scope.selected_organism = function(item, model,label){
         $scope.organism = item;
         document.getElementById('result_organism').style.display = "block";
      };

      $scope.selected_pathologies = function(item, model,label){
         $scope.pathologies = item;
         document.getElementById('result_pathologies').style.display = "block";
      };

      $scope.selected_molecule = function(item, model,label){
         $scope.molecule = item;
         document.getElementById('result_molecule').style.display = "block";
      };

      $scope.selected_technology= function(item, model,label){
         $scope.technology = item;
         document.getElementById('result_technology').style.display = "block";
      };

});

angular.module('chemsign').controller('adminCtrl',
  function ($scope, $rootScope, $routeParams, $log, $location, $filter, $window, User, Auth, Admin, Dataset, ngTableParams) {
      $scope.msg = null;
      var user = Auth.getUser();
      if (user === null || user === undefined || ! user.admin) {
          $location.path('');
      }
      $scope.project_number = 0;
      $scope.study_number = 0;
      $scope.assay_number = 0;
      $scope.signature_number = 0;
      $scope.users = null;
      $scope.pendings = null;
      Admin.dbinfo().$promise.then(function(data){
        $scope.project_number = data.project_number;
        $scope.study_number = data.study_number;
        $scope.assay_number = data.assay_number;
        $scope.signature_number = data.signature_number;
        $scope.users = data.users;
        $scope.pendings = data.pendings;
      });

      $scope.validate = function(project) {
        Admin.validate({'project':project}).$promise.then(function(data){
          $scope.msg=data.msg;
        });
      }

      $scope.Rdata = function(project) {
        Admin.validate({'project':""}).$promise.then(function(data){
          $scope.msg=data.msg;
        });
      }

       $scope.annofile = function(project) {
        Admin.validate({'project':"gohomo"}).$promise.then(function(data){
          $scope.msg=data.msg;
        });
      }

      $scope.unvalidation = function(project) {
        Admin.unvalidate({'project':project}).$promise.then(function(data){
          $scope.msg=data.msg;
        });
      }

});




angular.module('chemsign').service('Auth', function() {
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

angular.module('chemsign').service('SearchHits', function() {
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
