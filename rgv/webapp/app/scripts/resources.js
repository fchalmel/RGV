/*jslint sub:true, browser: true, indent: 4, vars: true, nomen: true */

(function () {
  'use strict';

    function Logout($resource) {
      return $resource('/logout');
    }

    function Search($resource) {
        return $resource('/search/:id', { }, {
            search_index: {
                url: '/search',
                method: 'POST',
                isArray: false,
                cache: false
            }
        });
    }

    function Dataset($resource) {
        return $resource('/info', {}, {
            get: {
                url: '/1',
                method: 'POST',
                isArray: false,
                cache: false
            },
            download: {
                url: '/dataset/:did/download',
                method: 'GET',
                isArray: false,
                cache: false
            },
            convert: {
                url: '/convert',
                method: 'POST',
                isArray: false,
                cache: false
            },
            run: {
                url: '/run',
                method: 'POST',
                isArray: false,
                cache: false
            },
            ontologies: {
                url: '/ontologies',
                method: 'POST',
                isArray: true,
                cache: false
            },
            pending: {
                url: '/pending',
                method: 'POST',
                isArray: false,
                cache: false
            },
            getjob: {
                url: '/getjob',
                method: 'POST',
                isArray: false,
                cache: false
            },
            readresult: {
                url: '/readresult',
                method: 'POST',
                isArray: false,
                cache: false
            }
        });
    }

    function Admin($resource) {
        return $resource('/admin', {}, {
            dbinfo: {
                url: '/infodatabase',
                method: 'GET',
                isArray: false,
                cache: false
            },
            validate: {
                url: '/validate',
                method: 'POST',
                isArray: false,
                cache: false
            },
            unvalidate: {
                url: '/unvalidate',
                method: 'POST',
                isArray: false,
                cache: false
            }
        });
    }

    function User($resource) {
        //var user = null;
        return $resource('/user/:uid', {}, {
            is_authenticated: {
                url: '/user/logged',
                method: 'POST',
                isArray: false,
                cache: false
            },
            datasets: {
                url: '/user/:uid/dataset',
                method: 'GET',
                isArray: true,
                cache: false
            },
            
            register: {
                url: '/user/register',
                method: 'POST',
                isArray: false,
                cache: false
            },
            recover: {
                url: '/user/recover',
                method: 'POST',
                isArray: false,
                cache: false
            },
            confirm_recover: {
                url: '/user/confirm_recover',
                method: 'POST',
                isArray: false,
                cache: false
            },
            confirm_email: {
                url: '/user/confirm_email',
                method: 'POST',
                isArray: false,
                cache: false
            },
            login: {
                url: '/user/login',
                method: 'POST',
                isArray: false,
                cache: false
            },
            project_save: {
                url: '/psave',
                method: 'POST',
                isArray: false,
                cache: false
            },
            update: {
                url: '/update',
                method: 'POST',
                isArray: false,
                cache: false
            },
            validate: {
                url: '/user/validate',
                method: 'POST',
                isArray: false,
                cache: false
            }
        });
    }

  angular.module('chemsign.resources', ['ngResource'])
    .factory('User', User)
    .factory('Dataset', Dataset)
    .factory('Admin', Admin)
    .factory('Search', Search)
    .factory('Logout', Logout);

}());
