/*global  angular:false */
/*jslint sub: true, browser: true, indent: 4, vars: true, nomen: true */
'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('rgv', ['rgv.resources', 'ngTouch', 'ui.grid','angular.filter', 'ui.grid.treeView', 'ui.grid.grouping','ui.bootstrap.accordion', 'ui.grid.autoResize', 'ui.grid.selection','angular-carousel', 'ngDialog', 'ngFileUpload', 'ngSanitize', 'ngCookies', 'ngRoute', 'ui.bootstrap', 'ui.tree', 'uuid', 'smart-table']).

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
            controller: 'statCtrl'
        });
        $routeProvider.when('/download', {
            templateUrl: 'views/download.html',
            controller: 'downloadCtrl'
        });
        $routeProvider.when('/tutorial', {
            templateUrl: 'views/tutorial.html',
            controller: 'tutoCtrl'
        });
        $routeProvider.when('/studies', {
            templateUrl: 'views/studies.html',
            controller: 'studiesCtrl'
        });

        $routeProvider.when('/browser_genome', {
            templateUrl: 'views/browser_genome.html',
            controller: 'genomeCtrl'
        });
        $routeProvider.when('/browser_genelevel', {
            templateUrl: 'views/browser_genelevel.html',
            controller: 'browsergenelevelCtrl'
        });
        $routeProvider.when('/browser_scRNAseq', {
            templateUrl: 'views/browser_scRNAseq.html',
            controller: 'browser_scRNAseqCtrl'
        });
        $routeProvider.when('/heatmap', {
            templateUrl: 'views/heatmap.html',
            controller: 'heatmapCtrl'
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
    function ($scope,$rootScope, $log, Auth, User,$location,$window) {
        $scope.is_logged = false;
        $rootScope.$on('loginCtrl.login', function (event, user) {
            $scope.user = user;
            $scope.is_logged = true;
        });
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



////////////////////// Studies ///////////////////////////////////////
angular.module('rgv').controller('studiesCtrl',
    function ($scope,$rootScope, $log, Auth, User,$q, Dataset) {

        var startPromise = Dataset.data_frame({"name":"metadata.csv"}).$promise.then(function(response){
            return $q.when(response)
        })
        startPromise.then(function(value){
            $scope.data_all = value.data;
            $scope.ome = value.ome;
            $scope.allspe = value.species;
            $scope.techno = value.technology;
            $scope.sex = value.sex
    
            //copy the references (you could clone ie angular.copy but then have to go through a dirty checking for the matches)
            $scope.displayedCollection = [].concat($scope.data_all);
        });

        $scope.replaceString = function(stingToReplace){
            if (stingToReplace == null){
                return " ";
            }
            if (stingToReplace.indexOf('|') > -1){
                var finalString = stingToReplace.split('|').join(', ');
                return finalString;
            } else {
                return stingToReplace;
            }
            
            
        }

        $scope.getSampleNumber = function(SRRList){
            if (SRRList == null){
                return " ";
            }
            if (SRRList.indexOf('|') > -1){
                var finalString = SRRList.split('|');
                return finalString.length;
            } else {
                return 1;
            }
        }

});

////////////////////// Genome Browser ///////////////////////////////////////
angular.module('rgv').controller('genomeCtrl',
    function ($scope,$rootScope, $log, Auth, User, Dataset) {

        $scope.msg="";
        Dataset.read_file({"name":"dfghjkltyuio"}).$promise.then(function(dataset){
                $scope.Stat = dataset;
        });
});

////////////////////// Statistics  ///////////////////////////////////////
angular.module('rgv').controller('statCtrl',
    function ($scope,$rootScope, $log, Auth, User, Dataset) {

        $scope.msg="";
        Dataset.data_frame({"name":"metadata.csv",'stat':'stat'}).$promise.then(function(dataset){
                $scope.Stat = dataset;
                $scope.charts = dataset.chart_techno;
                $scope.charts2 = dataset.chart_bt;
        });
});

////////////////////// Downloads ///////////////////////////////////////
angular.module('rgv').controller('downloadCtrl',
    function ($scope,$rootScope, $log, Auth, User) {

        $scope.msg="";

});

////////////////////// Tutorial ///////////////////////////////////////
angular.module('rgv').controller('tutoCtrl',
    function ($scope,$rootScope, $log, Auth, User) {

        $scope.displayDiv = function(div){
            var x = document.getElementById(div);

            var arrayOfElements=document.getElementsByClassName('tutoinfo');
            var lengthOfArray=arrayOfElements.length;
            for (var i=0; i<lengthOfArray;i++){
                arrayOfElements[i].style.display='none';
            }
            if (x.style.display === "none") {
                x.style.display = "block";
            } else {
                x.style.display = "none";
            }
        }

});

////////////////////// CONTACT ///////////////////////////////////////
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


////////////////////// NEWS ////////////////////////////////////////
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
                scope.chart.config['modeBarButtons'] = [[{
                    name: 'Donwload plot as png',
                    icon: Plotly.Icons.camera,
                    click: function (gd) {
                      Plotly.downloadImage(gd, {
                        filename: scope.chart.name,
                        format: 'png',
                        width: gd._fullLayout.width,
                        height: gd._fullLayout.height
                      })
                    }
                  }, 'sendDataToCloud','select2d','zoomIn2d','zoomOut2d','autoScale2d','hoverClosestCartesian']]
                Plotly.newPlot(attrs.id, scope.chart.data, scope.chart.layout, scope.chart.config || {});
            });
        }
    };
});

////////////////////// SC RNAseq Browser////////////////////////////////////////
angular.module('rgv').controller('browser_scRNAseqCtrl',
function ($scope,$rootScope,$http,$filter, Dataset,uiGridConstants,$resource, $q, $templateCache) {
    //Get Gene level information
    $scope.dispalaySpe = function(dict, value){
        for(var key in dict) {
            if(dict[key] === value) {
                return key
            }
        }
    }
    $scope.lastgenes={};
    $scope.val_button = {};
    $scope.displayGeneExp = function(selected_lst,selected_class,selected_gene,model,stud){
        


        if (selected_gene.display == true) {
            $scope.msg = [];
            var directory_list = [];
            var genes_list = {};
            for (var i=0;i<selected_lst.length;i++){
                if (selected_lst[i].path !=null){
                    directory_list.push(selected_lst[i].path);
                }else{
                    $scope.msg.push(" No data available for study: "+selected_lst[i].Study+';');
                }
            }
            if(directory_list.length > 0){
                //test

                
                Dataset.scData({},{'directory':directory_list,'conditions':'scRNA-seq','genes':'','name':'','class':selected_class,'model':model}).$promise.then(function(response){
                    selected_gene.display = false;
                    $scope.val_button[stud][selected_gene.Symbol] = "Display";
                    $scope.time = response.time;
                    $scope.charts = response.charts;
                    
                });
            }else{
                $scope.msgwrn ="No data available. Please select other studies or contact RGV support.";
                return $scope.msgwrn;
            }
        }
        else {
            $scope.msg = [];
            var directory_list = [];
            var genes_list = {};
            for (var i=0;i<selected_lst.length;i++){
                if (selected_lst[i].path !=null){
                    directory_list.push(selected_lst[i].path);
                }else{
                    $scope.msg.push(" No data available for study: "+selected_lst[i].Study+';');
                }
            }
            var studList = [];
            if (selected_gene.GeneID !=null){
                $scope.lastgenes[selected_gene['stud_name']] = selected_gene;
                for(var stud in $scope.lastgenes){
                    studList.push(stud);
                    genes_list[$scope.lastgenes[stud].GeneID] = {'ensembl':$scope.lastgenes[stud].EnsemblID,'symbol':$scope.lastgenes[stud].Symbol,'study':stud};
                }
            }

            if(directory_list.length > 0){
                
                Dataset.scDataGenes({},{'directory':directory_list,'conditions':'scRNA-seq','genes':genes_list,'class':selected_class,'model':model,'studies':studList}).$promise.then(function(response){
                    for (var x in $scope.val_button[stud]){
                        $scope.val_button[stud][x] = "Display"
                    }
                    selected_gene.display = true;
                    $scope.val_button[stud][selected_gene.Symbol] = "Hide";
                    
                    $scope.time = response.time;
                    $scope.charts = response.charts;
                    
                    console.log(response);
                });

            }
        }
    };
    

    //GridData (ag-grid) system definition
    $scope.main = {};
    $scope.second = {};
    $scope.filterValue = null;
    $scope.users;
    $scope.chosen = [];
    $scope.selected_gene = [];
    $scope.allgenes = {};


    //liste obj selectionnés
    
    //Species list & tax_id
    $scope.speciesValue = null;
    Dataset.read_file({"name":"genomes"}).$promise.then(function(dataset){
        $scope.species = []
        for (var i=0;i<dataset.data.line.length;i++){
            var field = dataset.data.line[i].split('\t');
            $scope.species.push({'name':field[0],'tax_id':field[2].replace(/[\n]/gi, "" )});
        }
    });

    $scope.getTaxID = function(Species,speciesDict){
        for(var i=0;i<speciesDict.length;i++){
            if(speciesDict[i].name == Species){
                $scope.speciesValue = speciesDict[i].tax_id;
                return speciesDict[i].tax_id
            }
        }
    }
    $scope.selected = [];

    // Function to get data for all selected items
    $scope.selectAll = function (collection) {
    
        // if there are no items in the 'selected' array, 
        // push all elements to 'selected'
        if ($scope.selected.length === 0) {
        
        angular.forEach(collection, function(val) {
            
            $scope.selected.push(val); 
            
        });
        
        // if there are items in the 'selected' array, 
        // add only those that ar not
        } else if ($scope.selected.length > 0 && $scope.selected.length != $scope.data.length) {
        
        angular.forEach(collection, function(val) {
            
            var found = $scope.selected.indexOf(val);
            
            if(found == -1) $scope.selected.push(val);
            
        });
        
        // Otherwise, remove all items
        } else  {
        
            $scope.selected = [];
        
        }
    
    };
  
  // Function to get data by selecting a single row
  $scope.select = function(id) {
    
    var found = $scope.selected.indexOf(id);
    
    if(found == -1) $scope.selected.push(id);
    
    else $scope.selected.splice(found, 1);
    
  }
    

    var startPromise = Dataset.data_frame({"name":"metadata.csv"}).$promise.then(function(response){
        return $q.when(response)
    })
    startPromise.then(function(value){
        $scope.data_all = value.data;
        $scope.ome = value.ome;
        $scope.allspe = value.species;
        $scope.techno = value.technology;
        $scope.sex = value.sex

        //copy the references (you could clone ie angular.copy but then have to go through a dirty checking for the matches)
            $scope.displayedCollection = [].concat($scope.data_all);

    
    });
    
    $scope.replaceString = function(stingToReplace){
        if (stingToReplace == null){
            return " ";
        }
        if (stingToReplace.indexOf('|') > -1){
            var finalString = stingToReplace.split('|').join(', ');
            return finalString;
        } else {
            return stingToReplace;
        }
        
        
    }

    $scope.multiFile = null;

    $scope.hasSelected = function(){
        var selectedRows = $filter("filter")($scope.data_all, {
            isSelected: true
            }, true);
        $scope.chosen = selectedRows;
        $scope.multiFile = selectedRows;
        return true;
    };

    $scope.selectPath = function(study, newpath){
        var selectedRows = $filter("filter")($scope.data_all, {
            isSelected: true
            }, true);
        $scope.models = {};
        $scope.chosen = selectedRows;
        var index = $scope.chosen.indexOf(study);
        if ( index != -1){
            var stud = $scope.chosen[index];
            stud.path = newpath;

            var names = newpath.split('/');
            names = names[names.length - 1];
            names = names.replace("data_genelevel_","");
            names = names.replace(".txt","");
            names = names.replace("_"," ");
            
            if(names == "data genelevel"){
                names = 'Default'
            }
            names = names.replace("_"," ");


            stud["pathName"] = names;
            $scope.chosen[index] = stud;
        };

    };

    $scope.getName = function(stingToReplace){
        var names = stingToReplace.split('/');
        names = names[names.length - 1];
        names = names.replace("data_genelevel_","");
        names = names.replace(".txt","");
        names = names.replace("_"," ");
        
        if(names == "data genelevel"){
            names = 'Default'
        }
        names = names.replace("_"," ");
        return names
    }

    $scope.replaceStringtoList = function(stingToReplace){
        if (stingToReplace == null){
            return [""];
        }
        if (stingToReplace.indexOf('|') > -1){
            var finalString = stingToReplace.split('|');
            return finalString;
        } else {
            return [stingToReplace];
        }
    }

    $scope.selected_class ='';
    $scope.models = {};
    //Fonction visualisation gene Level
    $scope.msg = []
    $scope.showData = function(selected_lst,select_class,model){

        if($scope.val_button.length > 0){
            for( var y in scope.val_button){
                for (var x in $scope.val_button[stud]){
                    $scope.val_button[y][x] = "Display"
                }
            }
        }
        
        
        selected_lst = $scope.chosen;
        $scope.msg = [];
        var directory_list = [];
        var genes_list = {};
        var name = '';
        for (var i=0;i<selected_lst.length;i++){
            if (selected_lst[i].path !=null){
                directory_list.push(selected_lst[i].path);
                name = selected_lst[i].Author+'_'+selected_lst[i].Year
            }else{
                $scope.msg.push(" No data available for study: "+selected_lst[i].Study+';');
            }
        }
        if(directory_list.length > 0){
            //test
            Dataset.scData({},{'directory':directory_list,'conditions':'scRNA-seq','genes':'','class':select_class,'name':name,'model':model}).$promise.then(function(response){

                $scope.time = response.time;
                $scope.charts = response.charts;
            });
        }else{
            $scope.msgwrn ="No data available. Please select other studies or contact RGV support.";
            return $scope.msgwrn;
        }
        
    }
    $scope.get_item = function(item, model,label){
        $scope.higlight_gene = item;
     };

    $scope.select_genes = function(stud,selectedgene){
        $scope.msg = []
        var name = stud.path;
        selectedgene['stud_name'] = name;
        selectedgene['display'] = false;
        if ($scope.val_button[name] == undefined ){
            $scope.val_button[name] = {};
        }

        if ($scope.allgenes.hasOwnProperty(name)) {
            if ($scope.allgenes[name] != undefined){
                var index = $scope.allgenes[name].indexOf(selectedgene);
            if ( index != -1){
                $scope.allgenes[name].splice(index,1);
                $scope.val_button[selectedgene.Symbol] = {}
            } else{
                    $scope.allgenes[name].push(selectedgene);
                    $scope.val_button[name][selectedgene.Symbol]= "Display"
                    selectedgene = undefined;     
                }
            }
        } else {
            $scope.allgenes[name] = [];
            $scope.allgenes[name].push(selectedgene)
            $scope.val_button[name][selectedgene.Symbol]= "Display"
        }
    }

    $scope.remove_genes = function(gene,stud){
        var index = $scope.allgenes[stud].indexOf(gene);
        if ( index != -1){
            $scope.allgenes[stud].splice(index,1);                              
        };
    }

    $scope.remove_study = function(study){
        var index = $scope.chosen.indexOf(study);
        if ( index != -1){
            $scope.chosen.splice(index,1);
        };
    }

    $scope.select_study = function(study){
        study.selected ? study.selected = false : study.selected = true;
    }

    $scope.getAllSelectedRows = function() {
        var selectedRows = $filter("filter")($scope.data_all, {
          isSelected: true
        }, true);
        
        $scope.chosen = selectedRows;
      }
    
    $scope.get_genes = function(val,database,stud,speciesDict) {
        var species_val = '';
        for(var i=0;i<speciesDict.length;i++){
            if(speciesDict[i].name == stud.species){
                species_val = speciesDict[i].tax_id;
            }
        }
        return Dataset.autocomplete({},{'database':database,'search':val,'tax_id':species_val}).$promise.then(function(data){
            return data.map(function(item){
                    return item;
            });
        });
    };


                

    
});

////////////////////// HEATMAP ////////////////////////////////////////
////////////////////// HEATMAP ////////////////////////////////////////
////////////////////// HEATMAP ////////////////////////////////////////
////////////////////// HEATMAP ////////////////////////////////////////
////////////////////// HEATMAP ////////////////////////////////////////
////////////////////// HEATMAP ////////////////////////////////////////
angular.module('rgv').controller('heatmapCtrl',
function ($scope,$rootScope,$http,$filter, Dataset,uiGridConstants, $q, $templateCache) {
    //Get Gene level information
    $scope.dispalaySpe = function(dict, value){
        for(var key in dict) {
            if(dict[key] === value) {
                return key
            }
        }
    }

    $scope.checklist = function(stud,speciesDict){
        var x = document.getElementById("genearea").value;
        var list_x = x.split("\n");
        var species_val = '';
        for(var i=0;i<speciesDict.length;i++){
            if(speciesDict[i].name == stud.species){
                species_val = speciesDict[i].tax_id;
            }
        }
        var species_val = "10090"; // Comment in prod
        console.log(list_x);
        Dataset.checkgene({"list":list_x,"tax_id":species_val}).$promise.then(function(dataset){
            console.log(dataset.data);
            $scope.checklistofgenes = dataset.data;
        });    
    }
    

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
    $scope.allgenes = {};

    //liste obj selectionnés
    
    //Species list & tax_id
    $scope.speciesValue = null;
    Dataset.read_file({"name":"genomes"}).$promise.then(function(dataset){
        $scope.species = []
        console.log(dataset);
        for (var i=0;i<dataset.data.line.length;i++){
            var field = dataset.data.line[i].split('\t');
            $scope.species.push({'name':field[0],'tax_id':field[2].replace(/[\n]/gi, "" )});
        }
        console.log($scope.species);
    });

    $scope.getTaxID = function(Species,speciesDict){
        for(var i=0;i<speciesDict.length;i++){
            if(speciesDict[i].name == Species){
                $scope.speciesValue = speciesDict[i].tax_id;
                return speciesDict[i].tax_id
            }
        }
    }
    
    var startPromise = Dataset.data_frame({"name":"metadata.csv"}).$promise.then(function(response){
        return $q.when(response)
    })
    startPromise.then(function(value){
        console.log(value)
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
    
    
    $scope.violinPlot = function(data){
        console.log(data);
    }
    //Angular UI-grid END

    $scope.selected_class ='';
    $scope.models = {};
    //Fonction visualisation gene Level
    $scope.msg = []
    $scope.showData = function(selected_lst,select_class,model,genes){
        $scope.msg = [];
        var directory_list = [];
        var genes_list = {};
        var name = '';
        for (var i=0;i<selected_lst.length;i++){
            if (selected_lst[i].path !=null){
                directory_list.push(selected_lst[i].path);
                name = selected_lst[i].Author+'_'+selected_lst[i].Year
            }else{
                $scope.msg.push(" No data available for study: "+selected_lst[i].Study+';');
            }
        }
        if(directory_list.length > 0){
            //test
            Dataset.hmtData({},{'directory':directory_list,'conditions':'scRNA-seq','genes':genes,'class':select_class,'name':name,'model':model}).$promise.then(function(response){

                $scope.time = response.time;
                $scope.charts = response.charts;
                console.log(response);
            });
        }else{
            $scope.msgwrn ="No data available. Please select other studies or contact RGV support.";
            return $scope.msgwrn;
        }
        
    }
    $scope.get_item = function(item, model,label){
        $scope.higlight_gene = item;
     };

    $scope.select_genes = function(stud,selectedgene){
        $scope.msg = []
        var name = stud.path;
        selectedgene['stud_name'] = name;
        selectedgene['display'] = false;
        if ($scope.val_button[name] == undefined ){
            $scope.val_button[name] = {};
        }

        if ($scope.allgenes.hasOwnProperty(name)) {
            if ($scope.allgenes[name] != undefined){
                var index = $scope.allgenes[name].indexOf(selectedgene);
            if ( index != -1){
                $scope.allgenes[name].splice(index,1);
                $scope.val_button[selectedgene.Symbol] = {}
            } else{
                    $scope.allgenes[name].push(selectedgene);
                    $scope.val_button[name][selectedgene.Symbol]= "Display"
                    selectedgene = undefined;     
                }
            }
        } else {
            $scope.allgenes[name] = [];
            $scope.allgenes[name].push(selectedgene)
            $scope.val_button[name][selectedgene.Symbol]= "Display"
        }
    }

    $scope.remove_genes = function(gene,stud){
        var index = $scope.allgenes[stud].indexOf(gene);
        if ( index != -1){
            $scope.allgenes[stud].splice(index,1);                              
        };
    }

    $scope.remove_study = function(study){
        var index = $scope.chosen.indexOf(study);
        console.log(study)
        if ( index != -1){
            $scope.chosen.splice(index,1);
        };
    }
    
    $scope.get_genes = function(val,database,stud,speciesDict) {
        var species_val = '';
        for(var i=0;i<speciesDict.length;i++){
            if(speciesDict[i].name == stud.species){
                species_val = speciesDict[i].tax_id;
            }
        }
        console.log(stud.species)
        return Dataset.autocomplete({},{'database':database,'search':val,'tax_id':species_val}).$promise.then(function(data){
            return data.map(function(item){
                    return item;
            });
        });
    };
                
});


////////////////////// Gene-level ////////////////////////////////////////
angular.module('rgv').controller('browsergenelevelCtrl',
    function ($scope,$rootScope,$http,$filter, Dataset,uiGridConstants, $q, $templateCache) {
        
        //Get Gene level information
    $scope.dispalaySpe = function(dict, value){
        for(var key in dict) {
            if(dict[key] === value) {
                return key
            }
        }
    }
    
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

    $scope.replaceString = function(stingToReplace){
        if (stingToReplace == null){
            return " ";
        }
        if (stingToReplace.indexOf('|') > -1){
            var finalString = stingToReplace.split('|').join(', ');
            return finalString;
        } else {
            return stingToReplace;
        }
        
        
    }

    $scope.replaceStringtoList = function(stingToReplace){
        if (stingToReplace == null){
            return [""];
        }
        if (stingToReplace.indexOf('|') > -1){
            var finalString = stingToReplace.split('|');
            return finalString;
        } else {
            return [stingToReplace];
        }
    }


    $scope.filterValue = null;
    $scope.users;
    $scope.chosen = [];
    $scope.selected_gene = [];
    $scope.allgenes = {};


    //liste obj selectionnés
    
    //Species list & tax_id
    $scope.speciesValue = null;
    Dataset.read_file({"name":"genomes"}).$promise.then(function(dataset){
        $scope.species = []
        console.log(dataset);
        for (var i=0;i<dataset.data.line.length;i++){
            var field = dataset.data.line[i].split('\t');
            $scope.species.push({'name':field[0],'tax_id':field[2].replace(/[\n]/gi, "" )});
        }
        console.log($scope.species);
    });

    $scope.getTaxID = function(Species,speciesDict){
        for(var i=0;i<speciesDict.length;i++){
            if(speciesDict[i].name == Species){
                $scope.speciesValue = speciesDict[i].tax_id;
                return speciesDict[i].tax_id
            }
        }
    }
    
    var startPromise = Dataset.data_frame({"name":"metadata.csv"}).$promise.then(function(response){
        return $q.when(response)
    })
    startPromise.then(function(value){
        var data_all = value.data;
        $scope.filterD = value.filter;
        $scope.data_all = value.data;
        $scope.ome = value.ome;
        $scope.allspe = value.species;
        $scope.techno = value.technology;
        $scope.sex = value.sex

        //copy the references (you could clone ie angular.copy but then have to go through a dirty checking for the matches)
            $scope.displayedCollection = [].concat($scope.data_all);


    
    });        

    $scope.multiFile = null;

    $scope.hasSelected = function(){
        var selectedRows = $filter("filter")($scope.data_all, {
            isSelected: true
            }, true);
        $scope.chosen = selectedRows;
        console.log($scope.chosen);
        $scope.multiFile = selectedRows;
        return true;
    };

    $scope.selectPath = function(study, newpath){
        var selectedRows = $filter("filter")($scope.data_all, {
            isSelected: true
            }, true);
        $scope.models = {};
        $scope.chosen = selectedRows;
        var index = $scope.chosen.indexOf(study);
        if ( index != -1){
            var stud = $scope.chosen[index];
            stud.path = newpath;

            var names = newpath.split('/');
            names = names[names.length - 1];
            names = names.replace("data_genelevel_","");
            names = names.replace(".txt","");
            names = names.replace("_"," ");
            
            if(names == "data genelevel"){
                names = 'Default'
            }
            names = names.replace("_"," ");


            stud["pathName"] = names;
            $scope.chosen[index] = stud;
        };

    };

    $scope.getName = function(stingToReplace){
        var names = stingToReplace.split('/');
        names = names[names.length - 1];
        names = names.replace("data_genelevel_","");
        names = names.replace(".txt","");
        names = names.replace("_"," ");
        
        if(names == "data genelevel"){
            names = 'Default'
        }
        names = names.replace("_"," ");
        return names
    }


    $scope.selected_class ='';
    $scope.models = {};
    //Fonction visualisation gene Level
    $scope.msg = []
    $scope.showData = function(selected_lst,select_class,genes,model){
        var selectedRows = $filter("filter")($scope.data_all, {
            isSelected: true
            }, true);

        $scope.chosen = selectedRows;
        selected_lst = $scope.chosen;
        $scope.msg = [];
        var directory_list = [];
        var genes_list = {};
        var name = '';
        for (var i=0;i<selected_lst.length;i++){
            if (selected_lst[i].path !=null){
                directory_list.push(selected_lst[i].path);
                name = selected_lst[i].Author+'_'+selected_lst[i].Year
            }else{
                $scope.msg.push(" No data available for study: "+selected_lst[i].Study+';');
            }
        }
        if(directory_list.length > 0){
            //test
            Dataset.genelevel({},{'directory':directory_list,'genes':genes,'class':select_class,'name':name,'model':model}).$promise.then(function(response){

                $scope.time = response.time;
                $scope.response = response;
                console.log(response);
            });
        }else{
            $scope.msgwrn ="No data available. Please select other studies or contact RGV support.";
            return $scope.msgwrn;
        }
        
    }
    $scope.get_item = function(item, model,label){
        $scope.higlight_gene = item;
     };

    $scope.select_genes = function(stud,selectedgene){
        $scope.msg = []
        var name = stud.path;
        selectedgene['stud_name'] = name;

        if ($scope.allgenes.hasOwnProperty(name)) {
            if ($scope.allgenes[name] != undefined){
                var index = $scope.allgenes[name].indexOf(selectedgene);
            if ( index != -1){
                $scope.allgenes[name].splice(index,1);                   
            } else{
                    $scope.allgenes[name].push(selectedgene);
                    selectedgene = undefined;     
                }
            }
        } else {
            $scope.allgenes[name] = [];
            $scope.allgenes[name].push(selectedgene)
        }
    }

    $scope.remove_genes = function(gene,stud){
        var index = $scope.allgenes[stud].indexOf(gene);
        if ( index != -1){
            $scope.allgenes[stud].splice(index,1);                              
        };
    }

    $scope.remove_study = function(study){
        var index = $scope.chosen.indexOf(study);
        console.log(study)
        if ( index != -1){
            $scope.chosen.splice(index,1);
        };
    }
    
    $scope.get_genes = function(val,database,stud,speciesDict) {
        var species_val = '';
        for(var i=0;i<speciesDict.length;i++){
            if(speciesDict[i].name == stud.species){
                species_val = speciesDict[i].tax_id;
            }
        }
        console.log(stud.species)
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

       

        var user = Auth.getUser();



        //Récupération news from local json file
        Dataset.news_feed().$promise.then(function(news){
    			console.log(news);
          if(news.status != 1){
            $scope.newsfeed = news.data["news_list"].slice(1, 5);
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

          User.login({},{'user_name': $scope.username, 'user_password': $scope.password}).$promise.then(function(data){
              console.log($scope.password);
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
