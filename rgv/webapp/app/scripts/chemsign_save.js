/*global  angular:false */
/*jslint sub: true, browser: true, indent: 4, vars: true, nomen: true */
'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('chemsign', ['chemsign.resources','angular-carousel', 'ngDialog','ngTableToCsv', 'ngFileUpload', 'ngSanitize', 'ngCookies', 'angular-js-xlsx', 'ngRoute','angular-venn', 'ui.bootstrap', 'datatables', 'ui.tree', 'uuid', 'ngTable','angucomplete-alt']).

config(['$routeProvider','$logProvider',
    function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'views/app.html',
            controller: 'appCtrl'
        });
        $routeProvider.when('/submit', {
            templateUrl: 'views/submit.html',
            controller: 'submitCtrl'
        });
        $routeProvider.when('/query', {
            templateUrl: 'views/query.html',
            controller: 'queryCtrl'
        });
        $routeProvider.when('/tools', {
            templateUrl: 'views/tools.html',
            controller: 'toolsCtrl'
        });
        $routeProvider.when('/downloads', {
            templateUrl: 'views/downloads.html',
            controller: 'downCtrl'
        });
        $routeProvider.when('/tutorials', {
            templateUrl: 'views/tutorials.html',
            controller: 'tutoCtrl'
        });
        $routeProvider.when('/help', {
            templateUrl: 'views/help.html',
            controller: 'helpCtrl'
        });
        $routeProvider.when('/dashboard', {
            templateUrl: 'tools/index.html',
            controller: 'dashCtrl'
        });
        $routeProvider.when('/enrich', {
            templateUrl: 'tools/enrich.html',
            controller: 'enrichCtrl'
        });
        $routeProvider.when('/dist', {
            templateUrl: 'tools/dist.html',
            controller: 'distCtrl'
        });
        $routeProvider.when('/extractts', {
            templateUrl: 'tools/extractts.html',
            controller: 'extractCtrl'
        });
        $routeProvider.when('/ontologies', {
            templateUrl: 'tools/ontologies.html',
            controller: 'ontologiesCtrl'
        });
        $routeProvider.when('/predict', {
            templateUrl: 'tools/prediction.html',
            controller: 'predictCtrl'
        });
        $routeProvider.when('/prio', {
            templateUrl: 'tools/prio.html',
            controller: 'prioCtrl'
        });
        $routeProvider.when('/compare', {
            templateUrl: 'tools/compare.html',
            controller: 'compareCtrl'
        });
        $routeProvider.when('/convert', {
            templateUrl: 'tools/convert.html',
            controller: 'convertCtrl'
        });
        $routeProvider.when('/search', {
            templateUrl: 'views/search.html',
            controller: 'searchCtrl'
        });
        $routeProvider.when('/dataset', {
            templateUrl: 'views/dataset.html',
            controller: 'datasetCtrl'
        });
        $routeProvider.when('/about', {
            templateUrl: 'views/about.html',
            controller: 'aboutCtrl'
        });
        $routeProvider.when('/dataset/:id/study', {
            templateUrl: 'views/study.html',
            controller: 'studiesCtrl'
        });
        $routeProvider.when('/dataset/:id/study/:tid', {
            templateUrl: 'views/study.html',
            controller: 'studiesCtrl'
        });
        $routeProvider.when('/dataset/:id/study/:tid/condition', {
            templateUrl: 'views/condition.html',
            controller: 'condCtrl'
        });
        $routeProvider.when('/dataset/:id/study/:tid/signature', {
            templateUrl: 'views/signature.html',
            controller: 'signatureCtrl'
        });
        $routeProvider.when('/dataset/:id/study/:tid/signature/:sid', {
            templateUrl: 'views/signature.html',
            controller: 'signatureCtrl'
        });
        $routeProvider.when('/database', {
            templateUrl: 'views/database.html',
            controller: 'databaseCtrl'
        });
        $routeProvider.when('/browse', {
            templateUrl: 'views/browse.html',
            controller: 'browseCtrl'
        });
        $routeProvider.when('/login', {
            templateUrl: 'views/login.html',
            controller: 'loginCtrl'
        });
        $routeProvider.when('/geo_import', {
            templateUrl: 'views/geo_import.html',
            controller: 'geoCtrl'
        });
        $routeProvider.when('/validate', {
            templateUrl: 'views/validate.html',
            controller: 'loginCtrl'
        });
        $routeProvider.when('/recover', {
            templateUrl: 'views/recover.html',
            controller: 'recoverCtrl'
        });
        $routeProvider.when('/admin', {
            templateUrl: 'views/admin.html',
            controller: 'adminCtrl'
        });
        $routeProvider.when('/user/:id', {
            templateUrl: 'views/user.html',
            controller: 'userInfoCtrl'
        });
        $routeProvider.when('/user/:id/myproject', {
            templateUrl: 'views/user_project.html',
            controller: 'userprojectCtrl'
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



angular.module('chemsign').controller('appCtrl',
    function ($scope,$rootScope, $log, Auth, Admin, User,$location) {
        $scope.msg = null;
        Admin.count_data().$promise.then(function(data){
              $scope.datasets = data;
              $scope.project = $scope.datasets[0]['val'];
              $scope.study = $scope.datasets[1]['val'];
              $scope.condition = $scope.datasets[2]['val'];
              $scope.signature = $scope.datasets[3]['val'];
        });

        var user = Auth.getUser();
        if(user !== null && user !== undefined && user['status'] == 'pending_approval') {
            $scope.msg = "Your account is pending approval, you will not be able to upload data in the meanwhile.";
        }

        if(user === null || user === undefined) {
            User.is_authenticated({},{}).$promise.then(function(data){
                $rootScope.$broadcast('loginCtrl.login', data);
                Auth.setUser(data);
            });
        }
        Admin.getLast().$promise.then(function(data){
          $scope.last = data;
        });

        Admin.getNews().$promise.then(function(data){
          $scope.news = data;
          $scope.myInterval = 5000;
          $scope.noWrapSlides = false;
          $scope.active = 0;
          var slides = $scope.slides = [];
          var currIndex = 0;
          var newWidth = 600 + slides.length + 1;
          
          slides.push({
            image: 'images/bg-profil.jpg',
            text: $scope.news.new,
            id: currIndex++
          });
        });
      
      $scope.show_dataset = function(dataset){
        $location.url('/browse?dataset='+dataset.id);
      };

      


  $scope.animationsEnabled = true;

});





angular.module('chemsign').controller('dashCtrl',
    function ($scope,$rootScope, $log, Auth, Admin, User, Dataset, $location) {
      $scope.user = Auth.getUser();
      console.log($scope.user);

      if($scope.user != null || $scope.user != undefined) {
            $scope.userFiles = User.listfiles();
      }
      else {
        $scope.userFiles = [];
      }
        $scope.msg = "Dashboard Tools";

        $scope.del = function(type,obj){
          if( type == 'file'){
            if (confirm('Are you sure you want to delete this file ?')) {
              Dataset.delinfo({'uid':$scope.user.id,'type':type,'object':obj}).$promise.then(function(data){
                alert(data.msg);
              });
            } 
          }
          else {
            Dataset.delinfo({'uid':$scope.user.id,'type':type,'object':obj}).$promise.then(function(data){
            alert(data.msg);
            });
          }
        }
        $scope.downloadsign = function (status,datasetid,selectedstud,signasso_cond,selectedsign,file,uid){
        Dataset.signdownload({'status':status,'dataset':datasetid,'study':selectedstud,'condition':signasso_cond,'signature':selectedsign,'file':file,'uid':uid}).$promise.then(function(data){
          var link = document.createElement("a");
         // //console.log(data['url'])
          link.download = file+".txt";
          link.href = data['url'];
          link.click();
        });
      };

});

angular.module('chemsign').controller('downCtrl',
    function ($scope,$rootScope, $log, Auth, Admin, User, Dataset, $location) {
        $scope.msg = "Dashboard Tools";

});

angular.module('chemsign').controller('tutoCtrl',
    function ($scope,$rootScope, $log, Auth, Admin, User, Dataset, $location) {
        $scope.msg = "tuto Tools";

});

angular.module('chemsign').controller('predictCtrl',
    function ($scope,$rootScope, $log, Auth, Admin, User, Dataset, $location) {
      $scope.user = Auth.getUser();

      $scope.userFiles = User.listfiles();
      ////console.log($scope.userFiles);
        if($scope.user !== null && $scope.user !== undefined && $scope.user['status'] == 'pending_approval') {
            $scope.msg = "Your account is pending approval, you will not be able to upload data in the meanwhile.";
        }

        if($scope.user === null || $scope.user === undefined) {
            $location.url("/login");
        }
        $scope.msg = "Dashboard Tools";

});

angular.module('chemsign').controller('extractCtrl',
    function ($scope,$rootScope, $log, Auth, Admin, User, Dataset, $location) {
      $scope.user = Auth.getUser();

      $scope.userFiles = User.listfiles();
      ////console.log($scope.userFiles);
        if($scope.user !== null && $scope.user !== undefined && $scope.user['status'] == 'pending_approval') {
            $scope.msg = "Your account is pending approval, you will not be able to upload data in the meanwhile.";
        }

        if($scope.user === null || $scope.user === undefined) {
            $location.url("/login");
        }
        $scope.msg = "Dashboard Tools";

});

angular.module('chemsign').controller('distCtrl',
    function ($scope,$rootScope, $log, Auth, Admin, User, Dataset, $location) {
      $scope.user = Auth.getUser();

      $scope.userFiles = User.listfiles();
      ////console.log($scope.userFiles);
        if($scope.user !== null && $scope.user !== undefined && $scope.user['status'] == 'pending_approval') {
            $scope.msg = "Your account is pending approval, you will not be able to upload data in the meanwhile.";
        }

        if($scope.user === null || $scope.user === undefined) {
            $location.url("/login");
        }
        $scope.msg = "Dashboard Tools";

});

angular.module('chemsign').controller('prioCtrl',
    function ($scope,$rootScope, $log, Auth, Admin, User, Dataset, $location) {
      $scope.user = Auth.getUser();

      $scope.userFiles = User.listfiles();
      //console.log($scope.userFiles);
        if($scope.user !== null && $scope.user !== undefined && $scope.user['status'] == 'pending_approval') {
            $scope.msg = "Your account is pending approval, you will not be able to upload data in the meanwhile.";
        }

        if($scope.user === null || $scope.user === undefined) {
            $location.url("/login");
        }
        $scope.msg = "Dashboard Tools";

});

angular.module('chemsign').controller('enrichCtrl',
    function ($scope,$rootScope, $log, Auth, Admin, User, Dataset, $location, ngTableParams, $filter) {
      $scope.user = Auth.getUser();

      $scope.userFiles = User.listfiles();
      //console.log($scope.userFiles);
        if($scope.user !== null && $scope.user !== undefined && $scope.user['status'] == 'pending_approval') {
            $scope.msg = "Your account is pending approval, you will not be able to upload data in the meanwhile.";
        }

        if($scope.user === null || $scope.user === undefined) {
            $location.url("/login");
        }
        $scope.msg = "Dashboard Tools";
        $scope.filter ="pvalue";
        $scope.adjust_filter ="lt";
        $scope.value_filter =0.01;
        $scope.resultGo="";
        $scope.labels = [];
        $scope.series = [];
        $scope.filter_val = {};
        $scope.size = 0;

        $scope.add = function(){
          $scope.filter_val[$scope.filter]={'param':$scope.adjust_filter,'value':$scope.value_filter};
          $scope.filter ="pvalue";
          $scope.adjust_filter ="lt";
          $scope.value_filter =0.01;
          $scope.size = Object.keys($scope.filter_val).length;

        };

         $scope.param_del = function(key) {

            delete $scope.filter_val[key];
            $scope.size = Object.keys($scope.filter_val).length;
        };



        $scope.selected_information = [];

        $scope.showInfo = function(value){
          document.getElementById("chart").style.display = "block";
          $scope.labels = ['N','n','R','r'];
          $scope.series = ['Selected Information'];
          $scope.selected_information = [[value.N,value.n,value.R,value.r]]
        };


        $scope.enrich = function(signature){
          var myobj = JSON.parse(signature);     
          var signature_selected = myobj.id;
          $scope.Math = window.Math;
          var adm = myobj.adm
          //console.log(myobj);
          //console.log(typeof(myobj));
          //console.log(adm);
          //console.log(signature_selected);
          Dataset.enrich({'uid':$scope.user.id,'signature':signature_selected,'filter':$scope.filter_val,'adm':adm}).$promise.then(function(data){
              if (data.status == '1'){
                  alert(data.msg);
                  return 'ERROR'
              }
              else {
                $scope.resultGo = data.Bp;
                //console.log(data);
                alert(data.msg);
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

                $scope.resultMF = data.Mf;
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

                $scope.resultcc = data.Cc;
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

                $scope.resultds = data.Disease;
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
        };


});

angular.module('chemsign').controller('convertCtrl',
    function ($scope,$rootScope, $log, Auth, Admin, User, Dataset, Upload, $location) {
      $scope.user = Auth.getUser();

      $scope.userFiles = User.listfiles();
      //console.log($scope.userFiles);
        if($scope.user !== null && $scope.user !== undefined && $scope.user['status'] == 'pending_approval') {
            $scope.msg = "Your account is pending approval, you will not be able to upload data in the meanwhile.";
        }

        if($scope.user === null || $scope.user === undefined) {
            $location.url("/login");
        }
        $scope.msg = "Dashboard Tools";
        $scope.listID = [];
        $scope.result="";
        $scope.species=0;
        $scope.way = ""
        $scope.selectFile = function(filename){
          Dataset.selectFile({'uid':$scope.user.id,'file':filename}).$promise.then(function(data){
              $scope.listID = data.data;
              //console.log(data.data);

          });
        };

        $scope.signature_upload = function(signature_file) {
            Upload.upload({
                url: '/dataset/XXXX/dfile',
                fields: {'uid': $scope.user.id, 'dataset': 'test','name':signature_file.name},
                file: signature_file
            }).progress(function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                //////console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
            }).success(function (data, status, headers, config) {
                //console.log('file ' + config.file.name + ' uploaded.');
                $scope.listID = data.data;
                //console.log(data.data);
                if (data.status == '1'){
                  alert(data.msg);
                }
            }).error(function (data, status, headers, config) {
                ////console.log('error status: ' + status);
            })
        };

        $scope.convert = function(listID){
          //console.log(listID)
          var send_list = listID.split('\n');
          Dataset.convert({'uid':$scope.user.id,'data':send_list,'convert':$scope.way,'species':$scope.species}).$promise.then(function(data){
              if (data.status == '1'){
                alert(data.msg);
                return 'Error'
              }
              $scope.result = data.data;
              //console.log(data.data);

          });
        };

        $scope.saveSelected = function(list,IDtype){
          var resultData = [];
          if(IDtype == 'HomoloGene'){
            for (var i=0;i<list.length;i++){
              resultData.push(list[i].HID);
            }
          }
          if(IDtype == 'EntrezGene'){
            for (var i=0;i<list.length;i++){
              resultData.push(list[i].Gene_ID);
            }
          }
          Dataset.venn({'data':resultData,'uid':$scope.user.id,'from':'compare','type':IDtype}).$promise.then(function(data){
              alert(data.msg);
              ////console.log(data);
          });
        }

        $scope.selection = [];

        $scope.toggleSelection = function toggleSelection(file) {
            var idx = $scope.selection.indexOf(file);
            // is currently selected
            if (idx > -1) {
              $scope.selection.splice(idx, 1);
              $scope.listID = []
            }

            // is newly selected
            else {
              $scope.selection.push(name);
              Dataset.selectFile({'uid':$scope.user.id,'file':file}).$promise.then(function(data){
                //console.log(data.data);
                $scope.listID = data.data;
                if (data.status == '1'){
                  alert(data.msg);
                }
              });
            }
        };

        $scope.select = [];
        $scope.toggleSelection2 = function toggleSelection2(names,sign,id) {
          var name = "";
          if(names == 'up'){
            name = id+'-'+names;
          }
          if(names == 'down'){
            name = id+'-'+names;
          }
          var obj = name
          var idx = $scope.select.indexOf(name);


          // is currently selected
          if (idx > -1) {
            $scope.select.splice(idx, 1);
            $scope.listID = []

          }

          // is newly selected
          else {
            $scope.select.push(name);
            $scope.listID = sign.join('\n');

          }
        };

});


angular.module('chemsign').controller('compareCtrl',
    function ($scope,$rootScope, $log, Auth, Admin, User, Dataset, ngDialog, $location) {
      $scope.user = Auth.getUser();

      //console.log($scope.user);

        if($scope.user !== null && $scope.user !== undefined && $scope.user['status'] == 'pending_approval') {
            $scope.msg = "Your account is pending approval, you will not be able to upload data in the meanwhile.";
        }

        if($scope.user === null || $scope.user === undefined) {
            $location.url("/login");
        }
        $scope.msg = "Dashboard Tools";
        $scope.save_values = "";
        $scope.userFiles = User.listfiles();

        $scope.open_info = function(id){
          ngDialog.open({ template: id, className: 'ngdialog-theme-default'});
        }

        $scope.saveSelected = function(){
          var select = document.getElementById('names').value;
          Dataset.venn({'data':select,'uid':$scope.user.id,'from':'venn'}).$promise.then(function(data){
              alert(data.msg);
              ////console.log(data);
          });
        }

        $scope.select = [];
        $scope.toggleSelection = function toggleSelection(file) {
            var name = file;
            var obj = name;
            var idx = $scope.select.indexOf(file);
            // is currently selected
            if (idx > -1) {
              $scope.select.splice(idx, 1);
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
              $scope.select.push(name);
              Dataset.selectFile({'uid':$scope.user.id,'file':file}).$promise.then(function(data){
                for(var z=0;z<$scope.list.length;z++){
                  if($scope.list[z].val ==" "){
                    $scope.list[z].val = name;
                    document.getElementById('name'+$scope.list[z].list).value = name;
                    document.getElementById('area'+$scope.list[z].list).value = data.data;
                    break
                  }
                }
                if (data.status == '1'){
                  alert(data.msg);
                }
              });
            }
        };

        // selected fruits
        $scope.selection = [];
        $scope.posistion = 0
        $scope.list = [{'list':1,'val':" "},{'list':2,'val':" "},{'list':3,'val':" "},{'list':4,'val':" "},{'list':5,'val':" "},{'list':6,'val':" "}]
        $scope.toggleSelection2 = function toggleSelection2(names,sign,id) {
          var name = "";
          if(names == 'up'){
            name = id+'-'+names;
          }
          if(names == 'down'){
            name = id+'-'+names;
          }
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
                document.getElementById('area'+$scope.list[z].list).value = sign.join('\n');
                break
              }
            } 
          }
        };

});


angular.module('chemsign').controller('ontologiesCtrl',
    function ($scope,$rootScope, $log, Auth, Admin, User,$location) {
      $scope.user = Auth.getUser();
        if($scope.user !== null && $scope.user !== undefined && $scope.user['status'] == 'pending_approval') {
            $scope.msg = "Your account is pending approval, you will not be able to upload data in the meanwhile.";
        }

        if($scope.user === null || $scope.user === undefined) {
            $location.url("/login");
        }
        $scope.msg = "Dashboard Tools";

        $scope.toggleSelection = function(selection){
          //console.log(selection);
        }
        $scope.onto_selected = "";


        $scope.getInfoOnto = function(ontoselected){
          //Check if div exist
          if (document.getElementById('widget_tree')){
            var obj = document.getElementById('tree_div_empty');
            var old = document.getElementById('widget_tree');
            obj.removeChild(old);
          }

          // Create new widget_tree div
          var iDiv = document.createElement('div');
          iDiv.id = 'widget_tree';
          iDiv.className = 'block';
          document.getElementById('tree_div_empty').appendChild(iDiv);

          var widget_tree = $("#widget_tree").NCBOTree({
                  apikey: "27f3a22f-92f8-4587-a884-e81953e113e6",
                  ontology: ontoselected,
                  afterSelect: function(event, classId, prefLabel, selectedNode){
                    //console.log(prefLabel);
                    //console.log(event);
                    //console.log(selectedNode);
                    var res = event.split("/").pop(-1);
                    //console.log(res);
                    res = res.replace("_",':');
                    
                    if(ontoselected == "FMA"){
                      res = res.replace("fma",'FMA:');
                    };
                    if(ontoselected == "NCBITAXON"){
                      res = "NCBITaxon:"+res;
                    };
                    //console.log(res);
                    $scope.frame = event;
                    $scope.idselected = res;
                    if (document.getElementById('info_div')){
                      var obj = document.getElementById('id_info_box');
                      var old = document.getElementById('info_div');
                      obj.removeChild(old);
                    }
                    // Create new widget_tree div
                    var jDiv = document.createElement('div');
                    jDiv.id = 'info_div';
                    jDiv.className = 'iframe-responsive-wrapper';
                    jDiv.innerHTML = "<h4>"+classId+" <a href='"+$scope.frame+"' target='_blank'>"+$scope.idselected+"</a></h4>";
                    document.getElementById('id_info_box').appendChild(jDiv)
                  
                }
              });
        }
        

});


angular.module('chemsign').controller('userprojectCtrl',
    function ($scope, $rootScope, $routeParams, $location, $filter, Auth, User, Dataset, ngTableParams, ngDialog, Upload) {
      $scope.user = Auth.getUser();

        $scope.open_info = function(id,dataset){
        //console.log(dataset);
        ngDialog.open({ template: id, className: 'ngdialog-theme-default',data: dataset});
      }
      var params = $location.search();
      $scope.max = 25;
      $scope.filter = "all";
      $scope.step=25;
      var toto=25;
      var debto = "0-"+toto.toString()
      User.showproject({'to': debto,'filter':'all'}).$promise.then(function(data){
              $scope.datasets = data;
              ////console.log(data);
      });

      $scope.update = function(stepval,filter){
        var to = "0-"+stepval.toString()
        //console.log(to)
        User.showproject({'to': to,'filter': filter}).$promise.then(function(data){
              $scope.datasets = data;
              ////console.log(data);
              ////console.log($scope.datasets);
        });

      };
      $scope.dataTest = "importExcel";
      $scope.signature_upload = function(signature_file, type) {
            ////console.log(signature_file);
            Upload.upload({
                url: '/dataset/'+$scope.dataTest+'/excelupload',
                fields: {'uid': $scope.user.id, 'dataset': $scope.dataTest},
                file: signature_file
            }).progress(function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                document.getElementById("bgimg").style.display = "block";
                //////console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
            }).success(function (data, status, headers, config) {
                //console.log('file ' + config.file.name + ' uploaded.');
                //console.log(data);
                if (data.status == '1'){
                  alert(data.msg)
                }
                else {
                  alert('Excel file uploaded')
                }
                document.getElementById("bgimg").style.display = "none";
            }).error(function (data, status, headers, config) {
                ////console.log('error status: ' + status);
            })
        };

      $scope.more = function(stepval,filter){
        var val = $scope.max;
        var deb = val + 1;
        var fin = val + parseInt(stepval) +1;
        $scope.max = fin;
        var to = deb.toString()+"-"+fin.toString()
        User.showproject({'to': to,'filter':filter}).$promise.then(function(data){
              $scope.datasets = data;
              ////console.log(data);
      });
      }
      $scope.back = function(stepval,filter){

        var val = $scope.max;
        var deb = val - (parseInt(stepval)*2);
        var fin = val - stepval ;
        
        if (deb < 0){
          deb = 0;
          fin = stepval;
        }
      
        $scope.max = fin;

        var to = deb.toString()+"-"+fin.toString()
        ////console.log(to);
        User.showproject({'to': to,'filter':filter}).$promise.then(function(data){
              $scope.datasets = data;
              ////console.log(data);
      });

      }

      $scope.dataset_update = function() {
          if($scope.dataset != null) {
              $scope.dataset.$save({'id': $scope.dataset.id}).then(function(data){
                  $scope.datasets = data;
              });
          }
      };


      $scope.project_del = function(dataset){
        var r = window.confirm("Do you really delete this project ? ")
        if (r == true) {
          User.delete_dataset({},dataset).$promise.then(function(data){
                  $scope.msg = data['msg'];
                  $scope.update($scope.step,$scope.filter);
          });
          
        };

      }

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


    $scope.show_dataset = function(dataset){
        $location.url('/browse?dataset='+dataset.id);
      };
    });





angular.module('chemsign').controller('userInfoCtrl',
    function ($scope, $rootScope, $routeParams, $location, Auth, User, Dataset) {
        $scope.user = null;
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

      $scope.userFiles = User.listfiles();
      $scope.action = 0; // show
      $scope.show_dataset = function(dataset){
        $location.url('/browse?dataset='+dataset.id);
      };

      Dataset.query().$promise.then(function(data){
          $scope.datasets = data;
      });

      $scope.dataset_update = function() {
          if($scope.dataset != null) {
              $scope.dataset.$save({'id': $scope.dataset.id}).then(function(data){
                  $scope.datasets = data;
              });
          }
      };


      $scope.dataset_remove = function(dataset) {
        var index = -1;
        for(var i=0;i<$scope.datasets.length;i++){
            if($scope.datasets[i] == dataset) {
                index = i;
                break;
            }
        }
        if(index > -1){
            $scope.datasets.splice(index, 1);
            $scope.dataset_update();
        }
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
        }
    });

  angular.module('chemsign').controller('aboutCtrl',
        function ($scope,$rootScope, Auth, User, Dataset, Search) {
            $scope.msg = 'should';
        });

  angular.module('chemsign').controller('toolsCtrl',
            function ($scope,$rootScope, Auth, User, Dataset, Upload, Search) {
            $scope.user = Auth.getUser();
            $scope.dataset="TST2356565";
            var content;
            $scope.signature_upload = function(signature_file, type) {
            ////console.log(signature_file);
            Upload.upload({
                url: '/dataset/'+$scope.dataset+'/excelupload',
                fields: {'uid': $scope.user.id, 'dataset': $scope.dataset},
                file: signature_file
            }).progress(function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                //////console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
            }).success(function (data, status, headers, config) {
                //console.log('file ' + config.file.name + ' uploaded.');
                //console.log(data);
                //if(type==0){
                    ////console.log(data);
                //    if ($scope.files === undefined){
                //      $scope.files = [];
                //      $scope.id = data.id;
                //    };
                //    var c = jQuery.extend(signature_file,data);
                //    $scope.files.push(c);
                //}
            }).error(function (data, status, headers, config) {
                ////console.log('error status: ' + status);
            })
        };

  });

  angular.module('chemsign').controller('helpCtrl',
            function ($scope,$rootScope, Auth, User, Dataset, Search) {
                $scope.msg = 'help';
            });

angular.module('chemsign').controller('queryCtrl',
    function ($scope,$rootScope, Auth, User, Dataset, Search, $filter, ngTableParams) {
        $scope.querymode = '';
        $scope.parameters = {};
        $scope.search_history = [];
        $scope.max = 0;
        $scope.query_init = "status:public";
        var associated_value = {"_all":"_all","Title":"title","Description":"description","Chemical":"studies.signatures.chemicaltag","Organism":"studies.signatures.orgatag","Tissue":"studies.signatures.tissuetag","Cell":"studies.signatures.celltag","Developmental stage":"studies.signatures.devstage","Phenotype":"studies.signatures.diseasetag","Generation":"studies.signatures.generation","Sex":"studies.signatures.sex","Technology":"studies.signatures.technotag","Study type":"studies.type","Experiment type":"studies.signatures.type","Signature type":"studies.signatures.signature_type","EntrezGene id up regulated":"studies.signatures.gene_up","EntrezGene id down regulated":"studies.signatures.gene_down"}

        $scope.param_add = function() {
            $scope.parameters[$scope.qlabel] = {"param":$scope.qparam.replace(/([!@#$%^&*()+=\[\]\\';,./{}|":<>?~_-])/g, "\\$1"),"operator":$scope.querymode,'label': associated_value[$scope.qlabel]};
            //console.log($scope.parameters[$scope.qlabel]);
            
            $scope.qlabel = '_all';
            $scope.qparam =  '';
        };

        $scope.more = function(stepval,filter){
            $scope.max = $scope.max + 100;
            var query_piece = $scope.query_init;
            for(var i in $scope.parameters){
              if($scope.parameters[i].operator ==''){
                $scope.parameters[i].operator = 'AND';
              }
              //console.log($scope.parameters[i]);
              query_piece = query_piece+' '+$scope.parameters[i].operator +' '+ $scope.parameters[i].label+":"+$scope.parameters[i].param;
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
          var query_piece = $scope.query_init;
            for(var i in $scope.parameters){
              if($scope.parameters[i].operator ==''){
                $scope.parameters[i].operator = 'AND';
              }
              //console.log($scope.parameters[i]);
              query_piece = query_piece+' '+$scope.parameters[i].operator +' '+ $scope.parameters[i].label+":"+$scope.parameters[i].param;
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
            delete $scope.parameters[key];
        };

        $scope.search_history_item = function(item) {
            $scope.parameters = item;
            $scope.search(false);
        }


        $scope.search = function(do_save) {
            if(do_save) {
                $scope.search_history.push(JSON.parse(JSON.stringify($scope.parameters)));
            }
            var query_piece = $scope.query_init;
            for(var i in $scope.parameters){
              if($scope.parameters[i].operator ==''){
                $scope.parameters[i].operator = 'AND';
              }
              //console.log($scope.parameters[i]);
              query_piece = query_piece+' '+$scope.parameters[i].operator +' '+ $scope.parameters[i].label+":"+$scope.parameters[i].param;
            }
            //console.log(query_piece)
            Search.search_index({"query":query_piece,'from':0}).$promise.then(function(data){
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
    });

angular.module('chemsign').controller('searchCtrl',
    function($scope, $rootScope, $routeParams, $log, $location, $window, User, Auth, SearchHits) {
        var hits = SearchHits.getHits();
        $scope.nb_match = hits.hits.total
        $scope.search_result = hits.hits.hits;
        //console.log($scope.search_result);
        $scope.studies = [];
        $scope.signatures = [];
        $scope.datasets = [];
        $scope.chemicalList = [];
        $scope.check = [];
        $scope.uniqlist = [];
        for(var i=0;i<$scope.search_result.length;i++){
                  var checkd = $scope.uniqlist.indexOf($scope.search_result[i]._source.id);
                  if(checkd === -1) {
                    $scope.datasets.push($scope.search_result[i]._source);
                    $scope.uniqlist.push($scope.search_result[i]._source.id);
                  }
                  else{
                    //////console.log("Already in dataset");
                  }
                  for(var j=0;j<$scope.search_result[i]._source['studies'].length;j++){
                    var checks = $scope.uniqlist.indexOf($scope.search_result[i]._source['studies'][j].id);
                    if(checks === -1) {
                      $scope.studies.push($scope.search_result[i]._source['studies'][j]);
                      $scope.uniqlist.push($scope.search_result[i]._source['studies'][j].id);
                    }
                    else{
                      //////console.log("Already in study");
                    }
                      for (var z=0;z<$scope.search_result[i]._source['studies'][j].signatures.length;z++){

                        var checksi = $scope.uniqlist.indexOf($scope.search_result[i]._source['studies'][j].signatures[j].id);
                        for (var c=0;c<$scope.search_result[i]._source['studies'][j].signatures[z].chemical.length;c++){
                            var chemi =  $scope.search_result[i]._source['studies'][j].signatures[z].chemical[c].split("CAS:")[0];
                            var casnb =  $scope.search_result[i]._source['studies'][j].signatures[z].chemical[c].split("CAS:")[1];
                            var objChem = {'name':chemi,'cas':casnb};
                            ////console.log(casnb);
                            var inChem = $scope.check.indexOf(chemi);
                            if(inChem === -1){
                              $scope.chemicalList.push(objChem);
                              $scope.check.push(chemi);
                              ////console.log($scope.chemicalList);
                            }
                        }
                        if(checksi === -1) {
                          $scope.signatures.push($scope.search_result[i]._source['studies'][j].signatures[j])
                          $scope.uniqlist.push($scope.search_result[i]._source['studies'][j].signatures[j].id);
                        }
                        else{
                          //////console.log("Already in signature");
                        }

                      }
                  };
        };

});

angular.module('chemsign').controller('browseCtrl',
  function($scope, $rootScope, $routeParams, $log, $location, $window, User, Upload, Dash, Dataset, Auth, ngDialog) {
      //$scope.list = [{'title': 'test1', 'items': [{'title': 'subtest1'},{'title': 'subtest2'}]}];
      $scope.user = Auth.getUser();

      if($window.sessionStorage.token) {
          $scope.token = $window.sessionStorage.token;
      }
      $scope.collaborator = null;
      $scope.location = location.host;
      $scope.urlabs = $location.absUrl();

      //if ($scope.user !== null){
      //  User.query().$promise.then(function(data){
      //      $scope.users = data;
      //  });
      //};
      $scope.displaysign =[];
      $scope.displaystud =[];
      $scope.selectedstud="";
      $scope.selectedsign="";
      $scope.url="";

      /////////////////////////////////////////////////////////////////////////////////
    //GET ONTOLOGY ASYNCHRONOUS
    $scope.get_onto = function(val,database) {
      ////console.log(database);
      return User.search({},{'database':database,'search':
        val}).$promise.then(function(data){
          return data.map(function(item){
               return item;
         });
       });
     };

    $scope.selecttissue = function(obj,item, model,label){
       if(obj.tissuetag == undefined){
        obj.tissuetag = [];
       }
       obj.tissuetag = item.all_name;
       for (var i=0;i<item.synonyms.length;i++){
         obj.tissuetag.push(item.synonyms[i]);
       }
       for (var i=0;i<item.direct_parent.length;i++){
         obj.tissuetag.push(item.direct_parent[i]);
       }
       for (var i=0;i<item.all_parent.length;i++){
         obj.tissuetag.push(item.all_parent[i]);
       }
       obj.tissuetag.push(item.id);
       obj.tissuetag.push(item.name);
     };

     $scope.selectorga = function(obj,item, model,label){
       if(obj.orgatag == undefined){
        obj.orgatag = [];
       }
       obj.orgatag = item.all_name;
       for (var i=0;i<item.synonyms.length;i++){
         obj.orgatag.push(item.synonyms[i]);
       }
       for (var i=0;i<item.direct_parent.length;i++){
         obj.orgatag.push(item.direct_parent[i]);
       }
       for (var i=0;i<item.all_parent.length;i++){
         obj.orgatag.push(item.all_parent[i]);
       }
       obj.orgatag.push(item.id);
       obj.orgatag.push(item.name);
     };

     $scope.selectdisease = function(obj,item, model,label){
       if(obj.diseasetag == undefined){
        obj.diseasetag = [];
       }
       obj.diseasetag = item.all_name;
       for (var i=0;i<item.synonyms.length;i++){
         obj.diseasetag.push(item.synonyms[i]);
       }
       for (var i=0;i<item.direct_parent.length;i++){
         obj.diseasetag.push(item.direct_parent[i]);
       }
       for (var i=0;i<item.all_parent.length;i++){
         obj.diseasetag.push(item.all_parent[i]);
       }
       obj.diseasetag.push(item.id);
       obj.diseasetag.push(item.name);
     };

     $scope.selectmol = function(obj,item, model,label){
       if(obj.moltag == undefined){
        obj.moltag = [];
       }
       obj.moltag = item.all_name;
       for (var i=0;i<item.synonyms.length;i++){
         obj.moltag.push(item.synonyms[i]);
       }
       for (var i=0;i<item.direct_parent.length;i++){
         obj.moltag.push(item.direct_parent[i]);
       }
       for (var i=0;i<item.all_parent.length;i++){
         obj.moltag.push(item.all_parent[i]);
       }
       obj.moltag.push(item.id);
       obj.moltag.push(item.name);
     };
     
     $scope.selecttechno = function(obj,item, model,label){
       if(obj.technotag == undefined){
        obj.technotag = [];
       }
       obj.technotag = item.all_name;
       for (var i=0;i<item.synonyms.length;i++){
         obj.technotag.push(item.synonyms[i]);
       }
       for (var i=0;i<item.direct_parent.length;i++){
         obj.technotag.push(item.direct_parent[i]);
       }
       for (var i=0;i<item.all_parent.length;i++){
         obj.moltag.push(item.all_parent[i]);
       }
       obj.technotag.push(item.id);
       obj.technotag.push(item.name);
     };
     ////////////////////////////////////////////////////////////////////////////////



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

      $scope.downloadsign = function (status,datasetid,selectedstud,signasso_cond,selectedsign,file,uid){
        Dataset.signdownload({'status':status,'dataset':datasetid,'study':selectedstud,'condition':signasso_cond,'signature':selectedsign,'file':file,'uid':uid}).$promise.then(function(data){
          var link = document.createElement("a");
          //console.log(data['url']);
          link.download = selectedsign+"_"+file;
          link.href = data['url'];
          link.click();
        });
      };

      var studopen = 0
      var signopen = 0
      var signselect = 0
      $scope.chemInfo = [];

      $scope.getInfo = function(dataset,studID){

        var elm = document.getElementById(studID+'_folder');
        //console.log(elm.className);
        if(elm.className == 'fa fa-folder fa-2x'){
          elm.className = 'fa fa-folder-open fa-2x';
        }
        else {
          elm.className = 'fa fa-folder fa-2x';
        }


        for(var i=0;i<$scope.dataset.studies.length;i++) {
          if(studID == $scope.dataset.studies[i].id){
            $scope.chemInfo = [];
            var inlist = [];
            //console.log(inlist);
            for(var j=0;j<$scope.dataset.studies[i].conditions.length;j++) {
              for(var k=0;k<$scope.dataset.studies[i].conditions[j].treatment.length;k++){
                if($scope.dataset.studies[i].conditions[j].treatment[k].chemicals != undefined){
                  for(var l=0;l<$scope.dataset.studies[i].conditions[j].treatment[k].chemicals.length;l++){
                    var allname = $scope.dataset.studies[i].conditions[j].treatment[k].chemicals[l].name;
                    var name = allname.split('CAS:')[0];
                    var casname = allname.split('CAS:')[1];
                    if(casname ===undefined){
                      casname = "NA";
                    }
                    var chemObj = {'name':name,'cas':casname};
                    var index = inlist.indexOf(name);
                    //console.log(index);
                    if(index == -1){
                      inlist.push(name);
                      $scope.chemInfo.push(chemObj);
                    }
                  }
                }
              }
            }
            break;
          }
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

      $scope.genoupfile="";
      $scope.genodownfile="";
      $scope.genoallfile="";
      $scope.supfile='';
      $scope.signature_upload = function(signature_file, type,signature,studID,geno) {
        var db = "";
        if (geno == 'info'){
          db = 'info';
        }
        else {
          var index = signature.genomic.indexOf(geno)
          db = signature.genomic[index].obs_effect;
        }
        Upload.upload({
            url: '/dataset/'+$scope.dataset.id+'/upload',
            fields: {'uid': $scope.user.id, 'dataset': $scope.dataset.id, 'type':type, 'assocond':signature.asso_cond, 'db':db, 'tmpdir':signature.tmpdir,'name':signature_file.name,'stud':studID},
            file: signature_file
        }).progress(function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            //////console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
            document.getElementById("bgimg").style.display = "block";
        }).success(function (data, status, headers, config) {
          //console.log('file ' + config.file.name + ' uploaded.');
          if(data.status=='0'){
            if(type == 0){
              $scope.genoupfile = config.file.name;
              signature.genomic[index].up = data.list;
              signature.gene_up = data.list
              signature.files.push("genomic_upward.txt");
              //console.log(signature.files);
            }
            if(type==1){
              $scope.genodownfile = config.file.name;
              signature.genomic[index].down = data.list;
              signature.gene_down = data.list
              signature.files.push("genomic_downward.txt");
              //console.log(signature.files);
            }
            if(type==2){
              $scope.genoallfile = config.file.name;
              signature.genomic[index].nde = data.list;
              signature.files.push("genomic_interrogated_genes.txt");
              //console.log(signature.files);
            }
            if(type==3){
              $scope.supfile = config.file.name;
              signature.supfiles = config.file.name;
              //console.log(signature.files);
            }
            for(var i=0;i<$scope.dataset.studies.length;i++) {
              if(studID == $scope.dataset.studies[i].id){
                for(var j=0;j<$scope.dataset.studies[i].signatures.length;j++) {
                  if(signature.id == $scope.dataset.studies[i].signatures[j].id){
                    $scope.dataset.studies[i].signatures[j] = signature;
                    var tempsEnMs = Math.round((new Date()).getTime() / 1000);
                    $scope.dataset.last_updated = tempsEnMs;
                    Dataset.savefile({'uid':$scope.user.id,'did': $scope.dataset.id,'eid': studID,'cid':signature.asso_cond,'sid':signature.id,'tmpdir':signature.tmpdir});
                    document.getElementById("bgimg").style.display = "none";
                    $scope.dataset.$update({'id': $scope.dataset.id}).then(function(data){
                          $scope.dataset = data;
                    });
                  }
                }
                break;
              }
            }
            alert(data.msg);
          }
          else {
            alert(data.msg);
          }
          
        }).error(function (data, status, headers, config) {
            //console.log('error status: ' + status);
        })
    };

      $scope.deletefile = function(filename,selectedsign,selectedstud,signasso_cond,type,signature){
        if (confirm('Do you want delete file ?')) {
          Dataset.delfile({'uid':$scope.user.id,'did': $scope.dataset.id,'eid': selectedstud,'cid':signasso_cond,'sid': selectedsign,'file':filename,'type':type})
          var index = signature.files.indexOf(filename);
          if (index > -1) {
              signature.files.splice(index, 1);
          }
          for(var i=0;i<$scope.dataset.studies.length;i++) {
              if(selectedstud == $scope.dataset.studies[i].id){
                for(var j=0;j<$scope.dataset.studies[i].signatures.length;j++) {
                  if(signature.id == $scope.dataset.studies[i].signatures[j].id){
                    $scope.dataset.studies[i].signatures[j] = signature;
                    var tempsEnMs = Math.round((new Date()).getTime() / 1000);
                    $scope.dataset.last_updated = tempsEnMs;
                    document.getElementById("bgimg").style.display = "none";
                    $scope.dataset.$update({'id': $scope.dataset.id}).then(function(data){
                          $scope.dataset = data;
                    });
                    $location.url('/browse?dataset='+$scope.dataset.id);
                  }
                }
                break;
              }
            }
        }
      }

      $scope.open_info = function(id){
        ngDialog.open({ template: id, className: 'ngdialog-theme-default'});
      }

      $scope.add_contributors = function(contributor){
          ////console.log(contributor);
          $scope.dataset.contributors[$scope.dataset.contributors.length] = contributor;
          ////console.log($scope.dataset.contributors);
          var formval = document.getElementById('dataset.contributor');
          formval.value = '';

      };


      $scope.showcme = false;
      $scope.changeTab = function(tabName){
        $scope.activeTab = tabName;
        if ($scope.showcme == false){
          $scope.showcme = true;
        }
        else {
          $scope.showcme = false;
        }
      };

      $scope.del_contributor = function(contributor){
        ////console.log(contributor);
        var i = $scope.dataset.contributors.indexOf(contributor);
          if(i != -1) {
          $scope.dataset.contributors.splice(i, 1);
        };
        ////console.log($scope.dataset.contributors);

      };


      $scope.add_link = function(link){
          ////console.log(link);
          $scope.dataset.ext_link[$scope.dataset.ext_link.length] = link;
          ////console.log($scope.dataset.ext_link);
          var formval = document.getElementById('lin');
          formval.value = '';

      };

      $scope.add_pub = function(link){
          ////console.log(link);
          if($scope.dataset.pubmed == undefined){
            $scope.dataset.pubmed = [];
          }
          $scope.dataset.pubmed[$scope.dataset.pubmed.length] = link;
          ////console.log($scope.dataset.ext_link);
          var formval = document.getElementById('pin');
          formval.value = '';

      };

      $scope.del_pub= function(link){
        ////console.log(link);
        var i = $scope.dataset.pubmed.indexOf(link);
          if(i != -1) {
          $scope.dataset.pubmed.splice(i, 1);
        };
        ////console.log($scope.dataset.ext_link);

      };

      $scope.del_link= function(link){
        ////console.log(link);
        var i = $scope.dataset.ext_link.indexOf(link);
          if(i != -1) {
          $scope.dataset.ext_link.splice(i, 1);
        };
        ////console.log($scope.dataset.ext_link);

      };

      var params = $location.search();
      ////console.log(params);
      if(params['dataset'] !== undefined) {
          Dataset.get({'id': params['dataset']}).$promise.then(function(data){
              $scope.show_dataset(data);
              console.log(data);
              if(params['studies'] !== undefined) {
                  for(var i=0;i<data.studies.length;i++) {
                      if(params['studies'] == data.studies[i].id){
                          $scope.study = data.studies[i];
                          if(params['signature'] !== undefined){
                             for(var j=0;j<data.studies[i].signatures.length;j++) {
                                 if(params['signature'] == data.studies[i].signatures[j].id){
                                     $scope.signature = data.studies[i].signatures[j];
                                     break;
                                 }
                             }
                          }
                          break;
                      }
                  }
              }
          });
      }


      $scope.study_del = function(dataset,study){
        if (confirm('Are you sure you want to delete this study and all associated information (conditions, signatures and files)?')) {
          var index = dataset.studies.indexOf(study);
          if (index > -1) {
            dataset.studies.splice(index, 1);
          };
          if($scope.dataset != null) {
            $scope.dataset.$update({'id': $scope.dataset.id}).then(function(data){
              $scope.dataset = data;
            });
            $location.url('/browse?dataset='+dataset.id);
          };
        } else {
            // Do nothing!
        }
      };

      $scope.condition_del = function(dataset,condition){
        ////console.log(dataset.conditions);
        var index = dataset.conditions.indexOf(condition);
        if (index > -1) {
          dataset.conditions.splice(index, 1);
        };
        if($scope.dataset != null) {
              $scope.dataset.$save({'id': $scope.dataset.id}).then(function(data){
                  $scope.dataset = data;
              });
              $location.url('/browse?dataset='+dataset.id);
          };
      };

      $scope.dataset_update = function() {
          if($scope.dataset != null) {
              var tempsEnMs = Math.round((new Date()).getTime() / 1000);
              $scope.dataset.last_updated = tempsEnMs;
              $scope.dataset.$update({'id': $scope.dataset.id}).then(function(data){
                  $scope.dataset = data;
              });
          }
      }

      $scope.add_todash = function(signID,dataset) {
          if ($scope.user === undefined){
            $location.url('/login');
          }
          else {
            var selectedSign = {}
            selectedSign['signID'] = signID;
            selectedSign['datasetID'] = dataset.id;
            Dataset.getsign({'uid': $scope.user.id,'dataset':dataset.id,'signID':signID}).$promise.then(function(data){
              alert(data.msg);
            });
          } 
      }

      $scope.to_public = function(){
        var r = window.confirm("Once you switch, you will not be able to modify your project. Are you sure ?")
        if (r == true) {
          if($scope.dataset != null) {
                $scope.dataset.status = 'pending approval'
                Dataset.switch({'uid':$scope.user.id,'dataset': $scope.dataset}).$promise.then(function(data){
                    $location.url('/browse?dataset='+$scope.dataset.id);
                });
            }
        }
      };



      $scope.signature_delete = function(dataset,study,sign){
        if (confirm('Are you sure you want to delete this study and all associated information (conditions, signatures and files)?')) {
          var indexStud = dataset.studies.indexOf(study);
          console.log(indexStud);
          console.log(dataset.studies[indexStud]);
          var index = dataset.studies[indexStud].signatures.indexOf(sign);
          if (index > -1) {
            dataset.studies[indexStud].signatures.splice(index, 1);
          };
          if($scope.dataset != null) {
            $scope.dataset.$update({'id': $scope.dataset.id}).then(function(data){
              $scope.dataset = data;
            });
            $location.url('/browse?dataset='+dataset.id);
          };
        } else {
            // Do nothing!
        }
      };

      $scope.collaborator_delete = function(collaborator) {
          var index = $scope.dataset.collaborators.indexOf(collaborator);
          $scope.dataset.collaborators.splice(index, 1);
      };

      $scope.collaborator_add = function(collaborator) {
          if($scope.dataset.collaborators === undefined) {
              $scope.dataset.collaborators = [];
          }
          $scope.dataset.collaborators.push(collaborator);

      }

      $scope.project_del = function(dataset){
        var r = window.confirm("Do you really delete this project ? ")
        if (r == true) {
          User.delete_dataset({},dataset).$promise.then(function(data){
                  $scope.msg = data['msg'];
          });
          $location.url("/user/"+dataset.owner+'/myproject');
        };

      }

      $scope.treatment_delete = function(study){
        var index = -1;
        for(var i=0;i<$scope.dataset.studies.length;i++){
            if($scope.dataset.studies[i] == study.id) {
                index = i;
                break;
            }
        }
        if(index > -1){
            $scope.dataset.studies.splice(index, 1);
            $scope.dataset_update();

        }
      };

      $scope.treatment_add = function(dataset) {
        var tempsEnMs = Math.round((new Date()).getTime() / 1000);
              $scope.dataset.last_updated = tempsEnMs;
              $scope.dataset.$save({'id': $scope.dataset.id}).then(function(data){
                  $scope.dataset = data;
              });
        $location.url("/dataset/"+dataset.id+'/study');
      };

      $scope.condition_add = function(dataset,study) {
        var tempsEnMs = Math.round((new Date()).getTime() / 1000);
              $scope.dataset.last_updated = tempsEnMs;
              $scope.dataset.$save({'id': $scope.dataset.id}).then(function(data){
                  $scope.dataset = data;
              });
        $location.url("/dataset/"+dataset.id+'/study/'+study.id+"/condition");
      };
      $scope.add_signature = function(dataset,study) {
        var tempsEnMs = Math.round((new Date()).getTime() / 1000);
              $scope.dataset.last_updated = tempsEnMs;
              $scope.dataset.$save({'id': $scope.dataset.id}).then(function(data){
                  $scope.dataset = data;
              });
        $location.url("/dataset/"+dataset.id+'/study/'+study.id+"/signature");
      };

      $scope.show_signature = function(dataset,study,signature){
        $location.url('/dataset/'+dataset.id+'/study/'+study+'/signature/'+signature);
      };

      $scope.show_dataset = function(dataset){
        $scope.dataset = dataset;
        $scope.study = null;
        //////console.log($scope.dataset);
      };

      $scope.dotoggle = function (dscope) {
           dscope.toggle();
      };

      $scope.show_treatment= function(dataset, study){
          $scope.dataset = dataset;
          $scope.study = study;
      };
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


      var params = $location.search();
      ////console.log(params);
      $scope.max = params['to'].split('-')[1]
      ////console.log($scope.max);
      if(params['to'] !== undefined) {
          User.showdb({'to': params['to']}).$promise.then(function(data){
              $scope.datasets = data;
          });
      }

      $scope.show_dataset = function(dataset){
      $location.url('/browse?dataset='+dataset.id);
    };

      $scope.more = function(){
        var val = parseInt($scope.max);
        ////console.log(val);
        var deb = val + 1
        var fin = val + 25
        var to = deb.toString()+"-"+fin.toString();
        $location.url('/database?to='+to);
      }

      $scope.back = function(){

        var val = $scope.max
        var deb = val - 50
        var fin = val - 25
        $scope.max = fin
        var to = deb.toString()+"-"+fin.toString()
        ////console.log(to);
        $location.url('/database?to='+to);

      }


      //if ($scope.user !== null){
      //  User.query().$promise.then(function(data){
      //      $scope.users = data;
      //  });
      //};

      ////console.log($scope.datasets);

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

      $scope.can_edit = function() {
          if($scope.dataset !== undefined && $scope.user !== undefined) {
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

      $scope.open_info = function(id){
        ngDialog.open({ template: id, className: 'ngdialog-theme-default'});
      }


      $scope.dataset_remove = function(dataset) {
        var index = -1;
        for(var i=0;i<$scope.datasets.length;i++){
            if($scope.datasets[i] == dataset.id) {
                index = i;
                break;
            }
        }
        if(index > -1){
            $scope.datasets.splice(index, 1);
        }
      }

      
      $scope.show_treatment= function(dataset, study){
          $scope.dataset = dataset;
          $scope.study = study;
      };
});



angular.module('chemsign').controller('datasetCtrl',
  function($scope, $rootScope, $routeParams, $log, $location, $modal, User, Dataset, Auth, $timeout) {
      var user = Auth.getUser();
      $scope.dataset= new Dataset();
      $scope.user = Auth.getUser();

      $scope.Math = window.Math;
      $scope.progress = 0;
      var getTitle = 0;
      var getDescription = 0;
      var getDesign = 0;
      var getResult = 0;
      var getPubmed = 0;


      $scope.$watch('dataset.result', function () {
        if($scope.dataset.result == undefined || $scope.dataset.result == '' &&  getResult == 1) {
          if($scope.progress - 1 >=0){
            $scope.progress --;
            getResult = 0;
          }
          else {
            $scope.progress = 0;
            getResult = 0;
          }
        }
          
        else {
          if(getResult == 0){
            $scope.progress ++;
            getResult = 1;
          }
          
        }
          
    });

      $scope.$watch('dataset.overalldesign', function () {
        if($scope.dataset.overalldesign == undefined || $scope.dataset.overalldesign == '' &&  getDesign == 1) {
          if($scope.progress - 1 >=0){
            $scope.progress --;
            getDesign = 0;
          }
          else {
            $scope.progress = 0;
            getDesign = 0;
          }
        }
          
        else {
          if(getDesign == 0){
            $scope.progress ++;
            getDesign = 1;
          }
          
        }
          
    });

      $scope.$watch('dataset.title', function () {
        if($scope.dataset.title == undefined || $scope.dataset.title == '' &&  getTitle == 1) {
          if($scope.progress - 1 >=0){
            $scope.progress --;
            getTitle = 0;
          }
          else {
            $scope.progress = 0;
            getTitle = 0;
          }
        }
          
        else {
          if(getTitle == 0){
            $scope.progress ++;
            getTitle = 1;
          }
          
        }
          
    });

      $scope.$watch('dataset.description', function () {
        if($scope.dataset.description == undefined || $scope.dataset.description == '' &&  getDescription == 1) {
          if($scope.progress - 1 >=0){
            $scope.progress --;
            getDescription = 0;
          }
          else {
            $scope.progress = 0;
            getDescription = 0;
          }
        }
          
        else {
          if(getDescription == 0){
            $scope.progress ++;
            getDescription = 1;
          }
          
        }
          
    });



      //User.query().$promise.then(function(data){
      //    $scope.users = data;
      //});

      $scope.dataset.contributors = [];
      $scope.add_contributors = function(contributor){
          ////console.log(contributor);
          $scope.dataset.contributors[$scope.dataset.contributors.length] = contributor;
          ////console.log($scope.dataset.contributors);
          var formval = document.getElementById('dataset.contributor');
          formval.value = '';

      };


       $scope.dataset.pubmed = [];
       $scope.add_pub = function(link){
          $scope.dataset.pubmed[$scope.dataset.pubmed.length] = link;
          ////console.log($scope.dataset.ext_link);
          var formval = document.getElementById('pin');
          formval.value = '';

      };

      $scope.del_pub= function(link){
        var i = $scope.dataset.pubmed.indexOf(link);
          if(i != -1) {
          $scope.dataset.pubmed.splice(i, 1);
        };
        ////console.log($scope.dataset.ext_link);

      };

      $scope.del_contributor = function(contributor){
        ////console.log(contributor);
        var i = $scope.dataset.contributors.indexOf(contributor);
          if(i != -1) {
          $scope.dataset.contributors.splice(i, 1);
        };
        ////console.log($scope.dataset.contributors);

      };


      $scope.dataset.ext_link = [];
      $scope.add_link = function(link){
          ////console.log(link);
          $scope.dataset.ext_link[$scope.dataset.ext_link.length] = link;
          ////console.log($scope.dataset.ext_link);
          var formval = document.getElementById('lin');
          formval.value = '';

      };

      $scope.del_link= function(link){
        ////console.log(link);
        var i = $scope.dataset.ext_link.indexOf(link);
          if(i != -1) {
          $scope.dataset.ext_link.splice(i, 1);
        };
        ////console.log($scope.dataset.ext_link);

      };

      $scope.open = function (size) {

      var modalInstance = $modal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'views/geo_import.html',
        controller: 'geoCtrl',
        size: size,
        resolve: {
          items: function () {
            return $scope.items;
          }
        }
      });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  $scope.toggleAnimation = function () {
    $scope.animationsEnabled = !$scope.animationsEnabled;
  };
    $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    ////console.log('CLOSE');
    $modalInstance.dismiss('close');
  };
  $scope.dataset.authors = $scope.user.id;

    
    //User.getmessages({'type':'dataset'}).$promise.then(function(data){
    //  var indexID = data;
    //  $scope.dataset.id = 'TSP'+indexID[0].val;
    //  IDD = 'TSP'+indexID[0].val;
    //  return $scope.dataset.id;
    //});




      $scope.dataset_add = function(){
      //$scope.dataset.collaborators = $scope.dataset.collaborators.replace(/^\s*|\s*$/g,'').split(/\s*,\s*/);
              ////console.log( $scope.identifier);
            if ($scope.dataset.id === undefined){
              User.getmessages({'type':'project'}).$promise.then(function(data){
                var indexID = data;
                $scope.dataset.id = 'TSP'+indexID[0].val;
                var test = 'TSP'+indexID[0].val;
                $scope.dataset.$save().then(function(data){
                  if(data.msg !== undefined) {
                      $scope.msg = data.msg;
                      return;
                  }
                  $location.url('/browse?dataset='+test);
                 //Dataset.query().$promise.then(function(data){
                 //     $location.url('/browse?dataset='+$scope.dataset.id);
                 // });
              });
              });
            }
            else {
              //console.log("ERROR ID");
            }
      };

      $scope.dataset_add_continue = function(){
      //$scope.dataset.collaborators = $scope.dataset.collaborators.replace(/^\s*|\s*$/g,'').split(/\s*,\s*/);
          if ($scope.dataset.id === undefined){
            User.getmessages({'type':'project'}).$promise.then(function(data){
                var indexID = data;
                var test = 'TSP'+indexID[0].val;
                $scope.dataset.id = 'TSP'+indexID[0].val;
                $scope.dataset.$save().then(function(data){
                  if(data.msg !== undefined) {
                      $scope.msg = data.msg;
                      return;
                  }
                  $location.url('/dataset/'+test+'/study');
                 //Dataset.query().$promise.then(function(data){
                    //$location.url('/browse?dataset='+test);
                  //});
              });
              });
          }
          else {
            //console.log("ERROR ID");
          }
        };


});

angular.module('chemsign').controller('signatureCtrl',
  function($scope, $rootScope, $routeParams, $log, $location, User, $window, Dataset, Auth, Upload, uuid4) {
    $scope.user = Auth.getUser();
    $scope.signature = {
        'physio': [],
        'genomic': [],
        'molecular': [],
        'env':[]
    }
    $scope.indice = -1;
    $scope.physio_signature = {};
    $scope.env_signature = {};
    $scope.genomic_signature = {};
    $scope.molecular_signature = {};
    Dataset.get({'id': $routeParams['id']}).$promise.then(function(data){
        $scope.dataset = data;
        for(var i=0;i<data.studies.length;i++) {
            if($routeParams['tid'] == data.studies[i].id){
                $scope.study = data.studies[i];
                $scope.indice = i;
                if($routeParams['sid'] !== undefined) {
                    for(var j=0;j<$scope.study.signatures.length;j++) {
                        if($scope.study.signatures[j].id == $routeParams['sid']) {
                            $scope.signature = $scope.study.signatures[j];
                            if($scope.study.signatures[j].physio !== undefined && $scope.study.signatures[j] !== undefined){
                              for(var z=0;z<$scope.study.signatures[j].physio.length;j++){
                                $scope.physio_signature = $scope.study.signatures[j].physio[z];
                              }
                            }
                            if($scope.study.signatures[j].genomic != undefined){
                              for(var w=0;w<$scope.study.signatures[j].genomic.length;j++){
                                $scope.genomic_signature = $scope.study.signatures[j].genomic[w];
                              }
                            }
                            if($scope.study.signatures[j].molecular != undefined){
                              for(var y=0;y<$scope.study.signatures[j].molecular.length;j++){
                                $scope.molecular_signature = $scope.study.signatures[j].molecular[y];
                              }
                            }
                            if($scope.study.signatures[j].env != undefined){
                              for(var y=0;y<$scope.study.signatures[j].env.length;j++){
                                $scope.env_signature = $scope.study.signatures[j].env[y];
                              }
                            }
                            break;
                        }
                    }
                }
                break;
            }
        }
    });
    $scope.files=[];
    $scope.tmpfiles=[];

    $scope.signature_delete = function(sub, indice) {
            $scope.signature[sub].splice(indice, 1);
    };

    $scope.show_dataset = function(dataset){
      $location.url('/browse?dataset='+dataset.id);
    };

    /////////////////////////////////////////////////////////////////////////////////
    //GET ONTOLOGY ASYNCHRONOUS
    $scope.get_onto = function(val,database) {
      ////console.log(database);
      return User.search({},{'database':database,'search':
        val}).$promise.then(function(data){
          return data.map(function(item){
               return item;
         });
       });
     };

     $scope.selecttissue = function(item, model,label){
       $scope.signature.tissuetag = item.all_name;
       for (var i=0;i<item.synonyms.length;i++){
         $scope.signature.tissuetag.push(item.synonyms[i]);
       }
       for (var i=0;i<item.direct_parent.length;i++){
         $scope.signature.tissuetag.push(item.direct_parent[i]);
       }
       for (var i=0;i<item.all_parent.length;i++){
         $scope.signature.tissuetag.push(item.all_parent[i]);
       }
       $scope.signature.tissuetag.push(item.id);
       $scope.signature.tissuetag.push(item.name);
     };

     $scope.selectdisease = function(item, model,label){
       $scope.signature.diseasetag = item.all_name;
       for (var i=0;i<item.synonyms.length;i++){
         $scope.signature.diseasetag.push(item.synonyms[i]);
       }
       for (var i=0;i<item.direct_parent.length;i++){
         $scope.signature.diseasetag.push(item.direct_parent[i]);
       }
       for (var i=0;i<item.all_parent.length;i++){
         $scope.signature.diseasetag.push(item.all_parent[i]);
       }
       $scope.signature.diseasetag.push(item.id);
       $scope.signature.diseasetag.push(item.name);
     };

     $scope.selectmol = function(item, model,label){
       $scope.signature.moltag = item.all_name;
       for (var i=0;i<item.synonyms.length;i++){
         $scope.signature.moltag.push(item.synonyms[i]);
       }
       for (var i=0;i<item.direct_parent.length;i++){
         $scope.signature.moltag.push(item.direct_parent[i]);
       }
       for (var i=0;i<item.all_parent.length;i++){
         $scope.signature.moltag.push(item.all_parent[i]);
       }
       $scope.signature.moltag.push(item.id);
       $scope.signature.moltag.push(item.name);
     };

     $scope.selecttechno = function(item, model,label){
       $scope.signature.technotag = item.all_name;
       for (var i=0;i<item.synonyms.length;i++){
         $scope.signature.technotag.push(item.synonyms[i]);
       }
       for (var i=0;i<item.direct_parent.length;i++){
         $scope.signature.technotag.push(item.direct_parent[i]);
       }
       for (var i=0;i<item.all_parent.length;i++){
         $scope.signature.technotag.push(item.all_parent[i]);
       }
       $scope.signature.technotag.push(item.id);
       $scope.signature.technotag.push(item.name);
     };
     ////////////////////////////////////////////////////////////////////////////////

     $scope.check_signature = function(){
        if($scope.signature.asso_cond != null && $scope.signature.asso_cond != '' && $scope.signature.asso_cond != undefined && $scope.signature.title != null && $scope.signature.title != '' && $scope.signature.title != undefined){
          return true;
        }
        else{
          return false;
        }
      }

      $scope.display_table = function(id){
        document.getElementById(id).style.display = "block";
        document.getElementById('selector').style.display = "none";
        
      };



     function signature_add() {
        ////console.log("DEBUG");
        ////console.log($scope.study.interventional_vivo.organism);
        ////console.log($scope.signature);
        ////console.log($scope.study);
      if ($scope.signature.id === undefined){
        User.getmessages({'type':'signature'}).$promise.then(function(data){
          var indexID = data;
          $scope.signature.files = $scope.files;
          $scope.signature.tmpdir = $scope.tmpdir
          $scope.signature.supfiles  = $scope.supfile ;
          $scope.signature.id = 'TSS'+indexID[0].val;
          $scope.signature.asso = $scope.dataset.id;
          $scope.signature.chemical=[];
          $scope.signature.route="";
          $scope.signature.vehicle="";
          $scope.signature.gene_up = $scope.signature['genomic'].up;
          $scope.signature.gene_down= $scope.signature['genomic'].down ;
          $scope.signature.signature_type="";
          if($scope.signature['physio'].length != 0 ) {
            $scope.signature.signature_type="physiological";
          }
          if($scope.signature['genomic'].length != 0) {
            $scope.signature.signature_type="genomic";
          }
          if($scope.signature['molecular'].length != 0 ) {
            $scope.signature.signature_type="molecular";
          }
          if($scope.signature['env'].length != 0) {
            $scope.signature.signature_type="environmental";
          }
          $scope.signature.type= $scope.study.interventional_experimental_type;
          if ($scope.study.type == 'observational'){
            $scope.signature.organism=$scope.study.observational_organism;
            if($scope.signature.orgatag === undefined){
              $scope.signature.orgatag = $scope.study.orgatag;
            }
            if($scope.signature.tissuetag === undefined){
              $scope.signature.tissuetag = $scope.study.tissuetag;
            }
            if($scope.signature.celltag === undefined){
              if ($scope.study.celltag !== undefined){
                $scope.signature.celltag = $scope.study.celltag;
              }
            }
          }
          if ($scope.study.interventional_experimental_type == 'in_vivo'){
            $scope.signature.organism=$scope.study.interventional_vivo.organism;
            $scope.signature.sex=$scope.study.interventional_vivo.sex;
            if($scope.signature.orgatag === undefined){
              $scope.signature.orgatag = $scope.study.orgatag;
            }
            if($scope.signature.tissuetag === undefined){
              $scope.signature.tissuetag = $scope.study.tissuetag;
            }
            if($scope.signature.celltag === undefined){
              if ($scope.study.celltag !== undefined){
                $scope.signature.celltag = $scope.study.celltag;
              }
            }
          }
          if ($scope.study.interventional_experimental_type == 'in_vitro'){
            $scope.signature.organism= $scope.study.interventional_vitro.organism;
            $scope.signature.generation=$scope.study.interventional_vitro.generation;
            $scope.signature.devstage= $scope.study.interventional_vitro.devstage;
            $scope.signature.sex= $scope.study.interventional_vitro.sex;
            $scope.signature.tissue= $scope.study.interventional_vitro.tissue +", "+$scope.study.interventional_vitro.cell_name;
            if($scope.signature.orgatag === undefined){
              $scope.signature.orgatag = $scope.study.orgatag;
            }
            if($scope.signature.tissuetag === undefined){
              $scope.signature.tissuetag = $scope.study.tissuetag;
            }
            if($scope.signature.celltag === undefined){
              if ($scope.study.celltag !== undefined){
                $scope.signature.celltag = $scope.study.celltag;
              }
            }
          }
          if ($scope.study.interventional_experimental_type == 'ex_vivo'){
            $scope.signature.organism= $scope.study.interventional_exvivo.organism;
            $scope.signature.generation=$scope.study.interventional_exvivo.generation;
            $scope.signature.devstage= $scope.study.interventional_exvivo.devstage;
            $scope.signature.sex= $scope.study.interventional_exvivo.sex;
            $scope.signature.tissue= $scope.study.interventional_exvivo.tissue;
            if($scope.signature.orgatag === undefined){
              $scope.signature.orgatag = $scope.study.orgatag;
            }
            if($scope.signature.tissuetag === undefined){
              $scope.signature.tissuetag = $scope.study.tissuetag;
            }
            if($scope.signature.celltag === undefined){
              if ($scope.study.celltag !== undefined){
                  $scope.signature.celltag = $scope.study.celltag;
              }
            }
          }
          if ($scope.study.interventional_experimental_type == 'other'){
            $scope.signature.organism= $scope.study.interventional_other.organism;
            $scope.signature.generation=$scope.study.interventional_other.generation;
            $scope.signature.devstage= $scope.study.interventional_other.devstage;
            $scope.signature.sex= $scope.study.interventional_other.sex;
            $scope.signature.tissue= $scope.study.interventional_other.tissue +", "+$scope.study.interventional_other.cell_name;
            if($scope.signature.orgatag === undefined){
              $scope.signature.orgatag = $scope.study.orgatag;
            }
            if($scope.signature.tissuetag === undefined){
              $scope.signature.tissuetag = $scope.study.tissuetag;
            }
            if($scope.signature.celltag === undefined){
              if ($scope.study.celltag !== undefined){
                  $scope.signature.celltag = $scope.study.celltag;
              }
            }
          }
          for (var i=0;i<$scope.study.conditions.length;i++){
                //////console.log($scope.study.conditions[i]);
            if ($scope.study.conditions[i].id == $scope.signature.asso_cond){
              $scope.signature.chemicaltag = $scope.study.conditions[i].chemicaltag;
            }

            for (var j=0;j<$scope.study.conditions[i].treatment.length;j++){
              //////console.log($scope.study.conditions[i].treatment[j]);

              if ($scope.study.conditions[i].treatment[j].chemicals !== undefined){
                for (var z=0;z<$scope.study.conditions[i].treatment[j].chemicals.length;z++){
                  //////console.log($scope.study.conditions[i].treatment[j].chemicals[z]);
                  if ($scope.study.conditions[i].id == $scope.signature.asso_cond){
                    $scope.signature.chemical.push($scope.study.conditions[i].treatment[j].chemicals[z]);
                    $scope.signature.route=$scope.study.conditions[i].treatment[j].chemicals[z].route;
                    $scope.signature.vehicle=$scope.study.conditions[i].treatment[j].chemicals[z].vehicle;
                    $scope.signature.time=$scope.study.conditions[i].treatment[j].chemicals[z].time;
                  }
                  else{
                    ////console.log("ERROR ASSO CONDITION")
                  }
                }
              }
            }
          }
          if($scope.signature['physio'].length == 0 && $scope.signature['genomic'].length == 0 && $scope.signature['molecular'].length == 0 && $scope.signature['env'].length == 0) {
            $scope.msg = 'Physio or genomic fields must contain at least one elements';
            ////console.log("Physio or genomic fields must contain at least one elements");
            return;
          }
          if($scope.signature.id !== undefined) {

            $scope.dataset.studies[$scope.indice]['signatures'].push($scope.signature);
            ////console.log("DEBUG");
            ////console.log($scope.signature)
          }
          else {
            // This is an edition
          }
          $scope.dataset.$update({'id': $scope.dataset.id}).then(function(data){
            if(data.msg !== undefined) {
                $scope.msg = data.msg;
                return;
            }
            else {
                ////console.log("location");
                ////console.log($scope.dataset.id);
                Dataset.savefile({'uid':$scope.user.id,'did': $scope.dataset.id,'eid':$routeParams['tid'],'cid':$scope.signature.asso_cond,'sid':$scope.signature.id,'tmpdir':$scope.signature.tmpdir});
                $location.url('/browse?dataset='+$scope.dataset.id);
            }
          });
        });
      }
      else {
        //console.log("ERROR signature ID");
      }    
    };

    $scope.signature_add_physio = function(){
        if ($scope.physio_signature.obs_effect =='' || $scope.physio_signature.obs_effect ==null){
          alert("Observed effect empty");
        }
        else if ($scope.physio_signature.asso =='' || $scope.physio_signature.asso ==null){
          alert("Associated phenotype, diseases processes or pathway empty");
        }
        else {
          $scope.signature['physio'].push($scope.physio_signature);
          $scope.physio_signature = {};
          alert('Physiological signature added');
          signature_add();
        }   
    };

    $scope.signature_add_env = function(){
      //console.log($scope.env_signature);
        if ($scope.env_signature.obs_effect =='' || $scope.env_signature.obs_effect ==null){
          alert("Observed effect empty");
        }
        else if ($scope.env_signature.asso =='' || $scope.env_signature.asso ==null){
          alert("Associated phenotype, diseases processes or pathway empty");
        }
        else if ($scope.env_signature.outcome =='' || $scope.env_signature.outcome ==null){
          alert("Outcome empty");
        }
        else if ($scope.env_signature.obs_effect =='' || $scope.env_signature.obs_effect ==null){
          alert("Outcome empty");
        }
        else {
          $scope.signature['env'].push($scope.env_signature);
          $scope.env_signature = {};
          alert('Environmental signature added');
          signature_add();
        }   
    };

    $scope.signature_add_molecular = function(){
          $scope.signature['molecular'].push($scope.molecular_signature);
          $scope.molecular_signature = {};
          alert('Molecular signature added');
          signature_add();
    };

    $scope.signature_add_genomic = function(){
        if ($scope.genomic_signature.up =='' || $scope.genomic_signature.up == null && $scope.genomic_signature.down =='' || $scope.genomic_signature.down == null){
            alert("Please fill at least upward or downward changes");
        }
        else if ($scope.genomic_signature.nde =='' || $scope.genomic_signature.nde ==null){
          alert("Interogated genes empty");
        }
        else if ($scope.genomic_signature.obs_effect =='' || $scope.genomic_signature.obs_effect ==null){
          alert("No identifier selected");
        }
        else if ($scope.genomic_signature.plateform =='' || $scope.genomic_signature.plateform ==null){
          alert("Platform field empty");
        }
        else if ($scope.genomic_signature.techno =='' || $scope.genomic_signature.techno ==null){
          alert("Technology field empty");
        }
        else {
          $scope.signature['genomic'].push($scope.genomic_signature);
          $scope.genomic_signature = {};
          alert('Genomic signature added');
          signature_add();
        }   
    };


    $scope.genoupfile="";
    $scope.genodownfile="";
    $scope.genoallfile="";
    $scope.supfile="";
    $scope.tmpdir="";

    $scope.signature_upload = function(signature_file, type) {
        ////console.log(signature_file);
        var db = "";
        if ($scope.genomic_signature.obs_effect === undefined){
          db = 'info';
        }
        else {
          db = $scope.genomic_signature.obs_effect;
        }
        document.getElementById("bgimg").style.display = "block";
        Upload.upload({
            url: '/dataset/'+$scope.dataset.id+'/upload',
            fields: {'uid': $scope.user.id, 'dataset': $scope.dataset.id, 'type':type, 'assocond':$scope.signature.asso_cond, 'db':db ,'tmpdir':$scope.tmpdir,'name':signature_file.name,'stud':$routeParams['tid']},
            file: signature_file
        }).progress(function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            //////console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
            
        }).success(function (data, status, headers, config) {
          if(data.status=='0'){
            if(type == 0){
              $scope.genoupfile = config.file.name;
              $scope.genomic_signature.up = data.list;
              $scope.tmpdir = data.dirname
              $scope.files.push("genomic_upward.txt");
              //console.log($scope.files);
            }
            if(type==1){
              $scope.genodownfile = config.file.name;
              $scope.genomic_signature.down = data.list;
              $scope.tmpdir = data.dirname
              $scope.files.push("genomic_downward.txt");
              //console.log($scope.files);
            }
            if(type==2){
              $scope.genoallfile = config.file.name;
              $scope.genomic_signature.nde = data.list;
              $scope.tmpdir = data.dirname
              $scope.files.push("genomic_interrogated_genes.txt");
              //console.log($scope.files);
            }
            if(type==3){
              $scope.supfile = config.file.name;
              $scope.tmpdir = data.dirname
              $scope.files.push("additional_information.txt");
              //console.log($scope.files);
            }
            document.getElementById("bgimg").style.display = "none";
            alert(data.msg);
          }
          else {
            alert(data.msg);
          }
          
        }).error(function (data, status, headers, config) {
            //console.log('error status: ' + status);
        })
    };
 });

angular.module('chemsign').controller('studiesCtrl',
  function($scope, $rootScope, $routeParams, $log, $location, User, $window, Dataset, Auth, uuid4,$filter,$anchorScroll, ngTableParams, ngDialog) {
      Dataset.get({'id': $routeParams['id']}).$promise.then(function(data){
          $scope.dataset = data;
          if($routeParams['tid'] !== undefined) {
              for(var i=0;i<data.studies.length;i++) {
                  if(data.studies[i].id == $routeParams['tid']) {
                      $scope.study = data.studies[i];
                      $scope.study_id = i;
                      break;
                  }
              }
          }
      });
      

      $scope.canUpdate = function(type){
        if(type == 'interventional'){
          if(($scope.study.interventional_title !=undefined && $scope.study.interventional_title !='') && ($scope.study.interventional_description !=undefined && $scope.study.interventional_description !='') && ($scope.study.interventional_experimental_type !=undefined && $scope.study.interventional_experimental_type !='') && (($scope.interventional_vivo.sex !=undefined && $scope.interventional_vivo.sex !='')|| ($scope.interventional_exvivo.sex != undefined && $scope.interventional_exvivo.sex !='') || ($scope.interventional_vitro.sex !=undefined && $scope.interventional_vitro.sex !='')  || ($scope.interventional_other.sex != undefined && $scope.interventional_other.sex != '')) && (($scope.interventional_vivo.organism !=undefined && $scope.interventional_vivo.organism !='')|| ($scope.interventional_exvivo.organism != undefined && $scope.interventional_exvivo.organism !='') || ($scope.interventional_vitro.organism !=undefined && $scope.interventional_vitro.organism !='')  || ($scope.interventional_other.organism != undefined && $scope.interventional_other.organism != ''))){
            return true;
          }
        }
        if(type == 'observational'){
          if(($scope.study.observational_title !=undefined && $scope.study.observational_title !='') && ($scope.study.observational_description !=undefined && $scope.study.observational_description !='') && ($scope.study.observational_organism !=undefined && $scope.study.observational_organism !='') ){
            return true;
          }
        }

      }

      $scope.interventional_vivo = {};
      $scope.interventional_exvivo = {};
      $scope.interventional_vitro = {};
      $scope.interventional_other = {};
      $scope.user = Auth.getUser();
      //console.log($scope.user);

      User.getalldata().$promise.then(function(data){
          $scope.datasets = data;
          $scope.allstudies = [];
          for(var i=0;i<$scope.datasets.length;i++) {
            if ($scope.datasets[i].studies.length > 0){
              for (var z=0;z<$scope.datasets[i].studies.length;z++){
                if ($scope.datasets[i].studies[z].type == 'interventional'){
                  $scope.allstudies = $scope.allstudies.concat($scope.datasets[i].studies[z]);
                }
              }
            }
          };
          //console.log($scope.allstudies)  

          $scope.conditionTable = new ngTableParams({
                page: 1,
                count: 5,
            },
             {
                total: $scope.allstudies.length,
                getData: function ($defer, params) {
                    $scope.data = params.sorting() ? $filter('orderBy')($scope.allstudies, params.orderBy()) : $scope.allstudies;
                    $scope.data = params.filter() ? $filter('filter')($scope.data, params.filter()) : $scope.data;
                    $scope.data = $scope.data.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    $defer.resolve($scope.data);
                }
          });
        });


        User.getalldata().$promise.then(function(data){
          $scope.datasets = data;
          $scope.allstudiesObs = [];
          for(var i=0;i<$scope.datasets.length;i++) {
            if ($scope.datasets[i].studies.length > 0){
              for (var z=0;z<$scope.datasets[i].studies.length;z++){
                if ($scope.datasets[i].studies[z].type == 'observational'){
                  $scope.allstudiesObs = $scope.allstudiesObs.concat($scope.datasets[i].studies[z]);
                }
              }
            }
          };
          //console.log($scope.allstudiesObs)  

          $scope.conditionTableObs = new ngTableParams({
                page: 1,
                count: 5,
            },
             {
                total: $scope.allstudiesObs.length,
                getData: function ($defer, params) {
                    $scope.data = params.sorting() ? $filter('orderBy')($scope.allstudiesObs, params.orderBy()) : $scope.allstudiesObs;
                    $scope.data = params.filter() ? $filter('filter')($scope.data, params.filter()) : $scope.data;
                    $scope.data = $scope.data.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    $defer.resolve($scope.data);
                }
          });
        });

       $scope.open_info = function(id){
        ngDialog.open({ template: id, className: 'ngdialog-theme-default'});
      }

      //////////////////////////////////////////////////////////////////////////////////
      //GET ONTOLOGY ASYNCHRONOUS
      $scope.get_onto = function(val,database) {
        ////console.log(database);
        return User.search({},{'database':database,'search':
          val}).$promise.then(function(data){
            return data.map(function(item){
                 return item;
           });
         });
       };

      $scope.selectorga = function(item, model,label){
        $scope.study.orgatag = item.all_name;
        for (var i=0;i<item.synonyms.length;i++){
          $scope.study.orgatag.push(item.synonyms[i]);
        }
        for (var i=0;i<item.direct_parent.length;i++){
          $scope.study.orgatag.push(item.direct_parent[i]);
        }
        for (var i=0;i<item.all_parent.length;i++){
          $scope.study.orgatag.push(item.all_parent[i]);
        }
        $scope.study.orgatag.push(item.id);
        $scope.study.orgatag.push(item.name);
      };

      $scope.selecttissue = function(item, model,label){
        $scope.study.tissuetag = item.all_name;
        for (var i=0;i<item.synonyms.length;i++){
          $scope.study.tissuetag.push(item.synonyms[i]);
        }
        for (var i=0;i<item.direct_parent.length;i++){
          $scope.study.tissuetag.push(item.direct_parent[i]);
        }
        for (var i=0;i<item.all_parent.length;i++){
          $scope.study.tissuetag.push(item.all_parent[i]);
        }
        $scope.study.tissuetag.push(item.id);
        $scope.study.tissuetag.push(item.name);
      };

      $scope.selectcell = function(item, model,label){
        $scope.study.celltag = item.all_name;
        for (var i=0;i<item.synonyms.length;i++){
          $scope.study.celltag.push(item.synonyms[i]);
        }
        for (var i=0;i<item.direct_parent.length;i++){
          $scope.study.celltag.push(item.direct_parent[i]);
        }
        for (var i=0;i<item.all_parent.length;i++){
          $scope.study.celltag.push(item.all_parent[i]);
        }
        $scope.study.celltag.push(item.id);
        $scope.study.celltag.push(item.name);
      };


       ////////////////////////////////////////////////////////////////////////////////


      $scope.display_table = function(id){
        document.getElementById(id).style.display = "block";
        document.getElementById('selector').style.display = "none";
        
      };

      $scope.show_dataset = function(dataset){
        $location.url('/browse?dataset='+dataset.id);
      };

      $scope.signature_add = function(dataset) {
        $location.url("/dataset/"+dataset.id+'/study/'+$scope.study.id+"/signature");
      };
      $scope.study = {};

      $scope.select_cond = function(study){
        $scope.study = study;
        $scope.interventional_vitro = study.interventional_vitro;
        $scope.interventional_vivo = study.interventional_vivo;
        $scope.interventional_other = study.interventional_other;
        $scope.interventional_exvivo = study.interventional_exvivo;
        $scope.study.asso = undefined;
        $scope.study.id = undefined;
        //console.log($scope.study)
      };

      //User.getmessages($scope.study).$promise.then(function(data){
      //var indexID = data;
      ////console.log(data);
      //for (var i =0;i< indexID.length;i++){
      //  $scope.study.id = 'TSE'+indexID[i].val;
      //}
      //});


      $scope.study_add = function(type){
        ////console.log($scope.interventional_vivo);
      if ($scope.study.id === undefined) {
        User.getmessages({'type':'study'}).$promise.then(function(data){
          var indexID = data;
          $scope.study.id = 'TSE'+indexID[0].val;
          if($scope.study.id !== undefined) {
              // New study

              $scope.study.asso = $scope.dataset.id;
              $scope.study.conditions = [];
              $scope.study.interventional_vivo =[];
              $scope.study.interventional_vivo.push($scope.interventional_vivo);
              $scope.study.interventional_exvivo =[];
              $scope.study.interventional_exvivo.push($scope.interventional_exvivo);
              $scope.study.interventional_vitro = [];
              $scope.study.interventional_vitro.push($scope.interventional_vitro);
              $scope.study.interventional_other = [];
              $scope.study.interventional_other.push($scope.interventional_other);
              $scope.study.type=type;
              $scope.study.signatures = [];
              $scope.dataset.studies.push($scope.study);
          }
          else {
              // This is an edition
              ////console.log("DEBUG");
              ////console.log($scope.dataset.studies);
          }
          $scope.dataset.$update({'id': $scope.dataset.id}).then(function(data){
                  ////console.log($scope.dataset.studies);
            $location.url('/browse?dataset='+$scope.dataset.id);
          });
        });
      }
      else {
        //console.log("ERROR study ID");
      }
    };

    $scope.study_add_continue = function(type){
      if ($scope.study.id === undefined) {
      User.getmessages({'type':'study'}).$promise.then(function(data){
        var indexID = data;
        $scope.study.id = 'TSE'+indexID[0].val;
        if($scope.study.id !== undefined) {
          // New study
          $scope.study.asso = $scope.dataset.id;
          $scope.study.conditions = [];
          $scope.study.signatures = [];
          $scope.study.interventional_vivo = $scope.interventional_vivo;
          $scope.study.interventional_exvivo = $scope.interventional_exvivo;
          $scope.study.interventional_vitro = $scope.interventional_vitro;
          $scope.study.interventional_other = $scope.interventional_other;
          $scope.study.type=type;
          $scope.dataset.studies.push($scope.study);
        }
        else {
              // This is an edition
              ////console.log("DEBUG");
              ////console.log($scope.dataset.studies);
        }
        $scope.dataset.$update({'id': $scope.dataset.id}).then(function(data){
            //$location.url('/browse?dataset='+$scope.dataset.id+'&condition='+$scope.study.id);
          $location.url("/dataset/"+$scope.dataset.id+'/study/'+$scope.study.id+"/condition");
        });
      });
  }
  else {
    //console.log("ERROR study ID");
  }
}
});


angular.module('chemsign').controller('condCtrl',
  function($scope, $rootScope, $routeParams, $log, $location, $window, Dataset, Auth, User, uuid4,$filter,$anchorScroll, ngTableParams) {
      Dataset.get({'id': $routeParams['id']}).$promise.then(function(data){
          $scope.dataset = data;
          ////console.log($routeParams['tid'])
          if($routeParams['tid'] !== undefined) {
              for(var i=0;i<data.studies.length;i++) {
                  if(data.studies[i].id == $routeParams['tid']) {
                      $scope.study = data.studies[i];
                      break;
                  }
              }
          }
      });

      $scope.idstud = $routeParams['tid'];

      ////console.log($scope.idstud);

      $scope.ec={};
      $scope.chemical={};
      $scope.physical={};
      $scope.biological = {};
      $scope.condition= {};
      
      $scope.dev = [];
      $scope.toggleSelection = function(select){
          ////console.log(contributor);
          $scope.dev[$scope.dev.length] = select;
          ////console.log($scope.dataset.contributors);

      };
      $scope.display_table = function(id){
        if (document.getElementById(id).style.display == "block"){
          document.getElementById(id).style.display = "none";
        }
        else {
          document.getElementById(id).style.display = "block";
        };
      };

      //////////////////////////////////////////////////////////////////////////////////
      //GET ONTOLOGY ASYNCHRONOUS
      $scope.get_onto = function(val,database) {
        ////console.log(database);
        return User.search({},{'database':database,'search':
          val}).$promise.then(function(data){
            return data.map(function(item){
                 return item;
           });
         });
       };
       $scope.selectchemical = function(item, model,label){
         if ($scope.condition.chemicaltag === undefined){
           $scope.condition.chemicaltag = item.all_name;
           for (var i=0;i<item.synonyms.length;i++){
             $scope.condition.chemicaltag.push(item.synonyms[i]);
           }
           for (var i=0;i<item.direct_parent.length;i++){
             $scope.condition.chemicaltag.push(item.direct_parent[i]);
           }
           for (var i=0;i<item.all_parent.length;i++){
             $scope.condition.chemicaltag.push(item.all_parent[i]);
           }
           $scope.condition.chemicaltag.push(item.id);
           $scope.condition.chemicaltag.push(item.name);
         }
         else {
           for (var i=0;i<item.all_name.length;i++){
             $scope.condition.chemicaltag.push(item.all_name[i]);
           }
           for (var i=0;i<item.synonyms.length;i++){
             $scope.condition.chemicaltag.push(item.synonyms[i]);
           }
           for (var i=0;i<item.direct_parent.length;i++){
             $scope.condition.chemicaltag.push(item.direct_parent[i]);
           }
           for (var i=0;i<item.all_parent.length;i++){
             $scope.condition.chemicaltag.push(item.all_parent[i]);
           }
           $scope.condition.chemicaltag.push(item.id);
           $scope.condition.chemicaltag.push(item.name);

         }

       };

       ////////////////////////////////////////////////////////////////////////////////

      Dataset.query().$promise.then(function(data){
          $scope.datasets = data;
          $scope.allcond = [];
          for(var i=0;i<$scope.datasets.length;i++) {
            if ($scope.datasets[i].conditions !== undefined){
              if ($scope.datasets[i].conditions.length > 0){
                for(var j=0;j<$scope.datasets[i].conditions.length;j++) {
                  if ($scope.datasets[i].conditions[j].condition !== undefined){
                    $scope.allcond.push($scope.datasets[i].conditions[j].condition);
                  };
                }
              }
            }
          };
          $scope.condTable = new ngTableParams({
                page: 1,
                count: 5,
            },
             {
                total: $scope.allcond.length,
                getData: function ($defer, params) {
                    $scope.data = params.sorting() ? $filter('orderBy')($scope.allcond, params.orderBy()) : $scope.allcond;
                    $scope.data = params.filter() ? $filter('filter')($scope.data, params.filter()) : $scope.data;
                    $scope.data = $scope.data.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    $defer.resolve($scope.data);
                }
      });
        });


      $scope.add_ec = function (){
        if($scope.condition.treatment === undefined) {
            $scope.condition.treatment = [];
        }
        $scope.condition.treatment.push($scope.ec);
        if($scope.condition.dev === undefined) {
            $scope.condition.dev = [];
        }
        $scope.condition.dev.push($scope.dev);


        $scope.ec={};
        $scope.chemical={};
        $scope.physical={};
        $scope.biological = {};
      };

      $scope.remove_ec= function(id){
        ////console.log(id);
        var i = $scope.condition.treatment.indexOf(id);
          if(i != -1) {
          $scope.condition.treatment.splice(i, 1);
        };
        ////console.log($scope.condition.treatment);
      };
      $scope.show_dataset = function(dataset){
        $location.url('/browse?dataset='+dataset.id);
      };

      $scope.signature_add = function(dataset) {
        $location.url("/dataset/"+dataset.id+'/study/'+$scope.study.id+"/signature");
      };

      $scope.control_add = function() {
          if($scope.study.control === undefined) {
              $scope.study.control = [];
          }
          $scope.study.control.push($scope.control);
      };

      $scope.chemicals={};
      $scope.physicals={};
      $scope.biologicals = {};

      $scope.chemicals_add = function() {
        if($scope.ec.chemicals === undefined) {
              $scope.ec.chemicals = [];
          }
          $scope.chemical.time=0;
          if ($scope.chemical.exposure_duration_unit == "seconds"){
            $scope.chemical.time = $scope.chemical.exposure_duration * 0.016666666666
          }
          if ($scope.chemical.exposure_duration_unit == "minutes"){
            $scope.chemical.time = $scope.chemical.exposure_duration * 1
          }
          if ($scope.chemical.exposure_duration_unit == "hours"){
            $scope.chemical.time = $scope.chemical.exposure_duration * 60
          }
          if ($scope.chemical.exposure_duration_unit == "hours"){
            $scope.chemical.time = $scope.chemical.exposure_duration * 1440
          }
          $scope.ec.chemicals.push($scope.chemical);
          $scope.chemical = {};
      };
      $scope.physicals_add = function() {
        if($scope.ec.physicals === undefined) {
              $scope.ec.physicals = [];
          }
          $scope.ec.physicals.push($scope.physical);
          $scope.physical = {};
      };
      $scope.biologicals_add = function() {
        if($scope.ec.biologicals === undefined) {
              $scope.ec.biologicals = [];
          }
          $scope.ec.biologicals.push($scope.biological);
          $scope.biological = {};
      };

      $scope.select_cond = function(condition){
        ////console.log(condition);
        var conds = condition.treatment;
        ////console.log(cond);
        for(var i=0;i<conds.length;i++) {
            var cond = conds[i];
            ////console.log(cond.chemicals);
        };

        if (cond.biologicals != undefined){
          if($scope.ec.biologicals === undefined) {
              $scope.ec.biologicals = [];
          };
          for (var i=0;i<cond.biologicals.length;i++){
            ////console.log(cond.biologicals[i].nature);
            $scope.nature = "biological";
            $scope.biological = cond.biologicals[i];
            $scope.ec.biologicals.push(cond.biologicals[i]);
          };
        };
        if (cond.physicals != undefined){
          if($scope.ec.physicals === undefined) {
              $scope.ec.physicals = [];
          };
          for (var i=0;i<cond.physicals.length;i++){
            ////console.log(cond.physicals[i].nature);
            $scope.nature = "physical";
            $scope.physical = cond.physicals[i];
            $scope.ec.physicals.push(cond.physicals[i]);
          };
        };
        if (cond.chemicals != undefined){
          if($scope.ec.chemicals === undefined) {
              $scope.ec.chemicals = [];
          };
          for (var i=0;i<cond.chemicals.length;i++){
            ////console.log(cond.chemicals[i].nature);
            $scope.nature = "chemical";
            $scope.chemical = cond.chemicals[i];
            $scope.ec.chemicals.push(cond.chemicals[i]);
          };
        };
      };

      $scope.dataset = Dataset.get({'id': $routeParams['id']});
      ////console.log($scope.dataset);

      

      $scope.condition_add = function(){
        if ($scope.condition.id === undefined) {
          User.getmessages({'type':'condition'}).$promise.then(function(data){
            var indexID = data;
            $scope.condition.id = 'TST'+indexID[0].val;
            if($scope.condition.id !== undefined) {

              $scope.condition.study = $scope.study.id;

              Dataset.get({'id': $routeParams['id']}).$promise.then(function(data){
                  $scope.dataset = data;
                  if($routeParams['tid'] !== undefined) {
                      for(var i=0;i<data.studies.length;i++) {
                          if(data.studies[i].id == $routeParams['tid']) {
                              $scope.dataset.studies[i].conditions.push($scope.condition);
                              $scope.dataset.$update({'id': $scope.dataset.id}).then(function(data){
                                  $scope.dataset = data;
                              });
                              $location.url('/browse?dataset='+$scope.dataset.id);
                          }
                      }
                  }
              });
            }
          });
        }
        else {
          if($scope.condition.id !== undefined) {

              $scope.condition.study = $scope.study.id;

              Dataset.get({'id': $routeParams['id']}).$promise.then(function(data){
                  $scope.dataset = data;
                  if($routeParams['tid'] !== undefined) {
                      for(var i=0;i<data.studies.length;i++) {
                          if(data.studies[i].id == $routeParams['tid']) {
                              $scope.dataset.studies[i].conditions.push($scope.condition);
                              $scope.dataset.$update({'id': $scope.dataset.id}).then(function(data){
                                  $scope.dataset = data;
                              });
                              $location.url('/browse?dataset='+$scope.dataset.id);
                          }
                      }
                  }
              });
            }
        }
      };


      $scope.condition_add_continue = function(){
        if ($scope.condition.id === undefined) {
          User.getmessages({'type':'condition'}).$promise.then(function(data){
            var indexID = data;
            $scope.condition.id = 'TST'+indexID[0].val;
            if($scope.condition.id !== undefined) {
              $scope.condition.study = $scope.study.id;

              Dataset.get({'id': $routeParams['id']}).$promise.then(function(data){
                  $scope.dataset = data;
                  if($routeParams['tid'] !== undefined) {
                      for(var i=0;i<data.studies.length;i++) {
                          if(data.studies[i].id == $routeParams['tid']) {
                              $scope.dataset.studies[i].conditions.push($scope.condition);
                              $scope.dataset.$update({'id': $scope.dataset.id}).then(function(data){
                                  $scope.dataset = data;
                              });
                              $location.url("/dataset/"+$scope.dataset.id+'/study/'+$scope.study.id+"/signature");
                          }
                      }
                  }
              });
            }
          });
        }
        else {
          if($scope.condition.id !== undefined) {
              $scope.condition.study = $scope.study.id;

              Dataset.get({'id': $routeParams['id']}).$promise.then(function(data){
                  $scope.dataset = data;
                  if($routeParams['tid'] !== undefined) {
                      for(var i=0;i<data.studies.length;i++) {
                          if(data.studies[i].id == $routeParams['tid']) {
                              $scope.dataset.studies[i].conditions.push($scope.condition);
                              $scope.dataset.$update({'id': $scope.dataset.id}).then(function(data){
                                  $scope.dataset = data;
                              });
                              $location.url("/dataset/"+$scope.dataset.id+'/study/'+$scope.study.id+"/signature");
                          }
                      }
                  }
              });
            }
        }
      }
});


angular.module('chemsign').controller('submitCtrl',
  function($scope, $rootScope, $routeParams, $log, $location, $window, Dataset, Auth) {
      $scope.action = 0; // show


      $scope.show_dataset = function(dataset){
        $location.url('/browse?dataset='+dataset.id);
      };

      Dataset.query().$promise.then(function(data){
          $scope.datasets = data;
      });

      $scope.dataset_update = function() {
          if($scope.dataset != null) {
              $scope.dataset.$save({'id': $scope.dataset.id}).then(function(data){
                  $scope.datasets = data;
              });
          }
      }


      $scope.dataset_remove = function(dataset) {
        var index = -1;
        for(var i=0;i<$scope.datasets.length;i++){
            if($scope.datasets[i] == dataset) {
                index = i;
                break;
            }
        }
        if(index > -1){
            $scope.datasets.splice(index, 1);
            $scope.dataset_update();
        }
      }

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



angular.module('chemsign').controller('userCtrl',
  function($scope, $rootScope, $routeParams, $log, $location, $window, User, Auth, Search, SearchHits,Dataset) {

    $scope.is_logged = false;
    $rootScope.$on('loginCtrl.login', function (event, user) {
      $scope.user = user;
      $scope.is_logged = true;
    });

    $scope.action = 0; // show

    $scope.show_dataset = function(dataset){
      $location.url('/browse?dataset='+dataset.id);
    };

    Dataset.query().$promise.then(function(data){
      $scope.datasets = data;
    });

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

      Search.search_index({'query': "status:public AND _all:"+$scope.search_sig,'from':0}).$promise.then(function(data){
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
angular.module('chemsign').controller('geoCtrl',
  function ($scope, $rootScope, $routeParams, $log, $location, $window, User, Auth) {
      var params = $location.search();
});

angular.module('chemsign').controller('loginCtrl',
  function ($scope, $rootScope, $routeParams, $log, $location, $window, User, Auth) {
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

      $scope.register_email = null;
      $scope.register_check_password = null;

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


      $scope.recover = function() {
          User.recover({},{'user_name': $scope.user_name}).$promise.then(function(data){
              $scope.msg = data.msg;
          });
      }

      $scope.register = function(){
        ////console.log("REGISTER");
          if($scope.register_email === null || $scope.register_email == ''){
              $scope.msg = 'User email is empty and must be a valid email address';
          }
          else if($scope.register_firstname === null || $scope.register_firstname == ''){
              $scope.msg = 'User first name is empty';
          }
          else if($scope.register_lastname === null || $scope.register_lastname == ''){
              $scope.msg = 'User last name is empty';
          }
          else if($scope.register_institute === null || $scope.register_institute == ''){
              $scope.msg = 'User institute is empty';
          }
          else if($scope.register_laboratory === null || $scope.register_laboratory == ''){
              $scope.msg = 'User laboratory is empty';
          }
          else if($scope.register_address === null || $scope.register_address == ''){
              $scope.msg = 'User address is empty';
          }
          else if($scope.register_country === null || $scope.register_country == ''){
              $scope.msg = 'User country is empty';
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
                                  'institute': $scope.register_institute,
                                  'laboratory': $scope.register_laboratory,
                                  'address': $scope.register_address,
                                  'referent': $scope.register_referent
                              }).$promise.then(function(data){
                  $scope.msg = data['msg'];
              });
          }
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


angular.module('chemsign').controller('adminCtrl',
  function ($scope, $rootScope, $routeParams, $log, $location, $filter, $window, User, Auth, Dataset, ngTableParams) {
      $scope.msg = null;
      var user = Auth.getUser();
      if (user === null || user === undefined || ! user.admin) {
          $location.path('');
      }


});
