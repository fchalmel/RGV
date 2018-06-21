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
        return $resource('/dataset', { }, {
            data_frame: {
                url: '/data_frame',
                method: 'POST',
                isArray: false,
                cache: false
            },
            read_file: {
                url: '/browser_genelevel_init',
                method: 'POST',
                isArray: false,
                cache: false
            },
            read_stat: {
                url: '/browser_stat',
                method: 'POST',
                isArray: false,
                cache: false
            },
            checkgene: {
                url: '/checkgene',
                method: 'POST',
                isArray: false,
                cache: false
            },
            news_feed: {
                url: '/newsfeed',
                method: 'GET',
                isArray: false,
                cache: false
            },
            study_feed: {
                url: '/studyfeed',
                method: 'GET',
                isArray: false,
                cache: false
            },
            autocomplete: {
                url: '/autocomplete',
                method: 'POST',
                isArray: true,
                cache: false
            },
            genelevel: {
                url: '/genelevel',
                method: 'POST',
                isArray: false,
                cache: false
            },
            scData: {
                url: '/scData',
                method: 'POST',
                isArray: false,
                cache: false
            },
            hmtData: {
                url: '/hmtData',
                method: 'POST',
                isArray: false,
                cache: false
            },
            scDataGenes: {
                url: '/scDataGenes',
                method: 'POST',
                isArray: false,
                cache: false
            },
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
            validate: {
                url: '/user/validate',
                method: 'POST',
                isArray: false,
                cache: false
            }
        });
    }

  angular.module('rgv.resources', ['ngResource'])
    .factory('User', User)
    .factory('Search', Search)
    .factory('Logout', Logout)
    .factory('Dataset', Dataset);

}());
