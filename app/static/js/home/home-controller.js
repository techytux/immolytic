angular.module('is24')
  .controller('HomeController', ['$scope', '$http', function ($scope, $http) {
    $http.get('http://127.0.0.1:5000/search').success(function(data) {
        $scope.resultList = data;
        $scope.testProperty = 'test data';
    });

    $scope.exposeList = [
    {'realEstateId': 75479552,
     'zipCode': '1234'},
    {'realEstateId': 75476462,
     'zipCode': '2222'},
    {'realEstateId': 75476463,
     'zipCode': '3333'}
    ];
  }]);
