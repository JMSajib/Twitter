$(document).ready(function(){
    /*$('#resultLink').on('click',function(){
        up_resultTestType();
    });*/

    //$('#resultTestType').on('change',function(){
    $('#resultLink').on('click',function(){
        $('#resultListTbl').DataTable({
            "destroy": true,
            "language": { "emptyTable": "No result available or published right now!" },
            "ajax": {
                    "url": '/user_result/',
                    "data": {'test_type': function() {
                            return $( "#resultTestType" ).val();
                          }},
                    "dataSrc": function ( json ) {
                            return json;
                        }
                  },
            "columns": [
                { "data": "test_id__subject_id__subject_name" },
                { "data": "test_id__test_name" },
                { "data": "test_id__test_totalmarks" },
                { "data": "gained_marks" },
                { "data": "is_passed",
                    render: function (data, type, row) {
                        return data === true ?
                        data.toString().replace( data, 'Passed' ) :
                        data.toString().replace( data, 'Failed' );
                    }
                },
                { "data": "datetime",
                    render: function (data, type, row) {
                        var date = new Date(data);
                        return (date.getDate() + '/' + (date.getMonth() + 1) + '/' +  date.getFullYear());
                    }
                },
                { "data": null }
            ],
            "columnDefs": [{
            // puts a button in the last column
                targets: [-1], "orderable":false, render: function (a, b, data, d) {
                    if (data.test_type === 2) {
                        return "<button type='button' class='btn btn-warning' data-id="+data.test_id+" id='resultDetails'>Details</button>";
                    }
                    return "";
                }
            }],
            "createdRow": function ( row, data, index ) {
                if ( data.is_passed === true ) {
                    $('td', row).eq(4).css('color', 'green');
                }
                else {
                    $('td', row).eq(4).css('color', 'red');
                }
            }
        });
    });

    var table = $('#resultListTbl').DataTable();

    table.on( 'click', '#resultDetails', function () {
        test_id = $(this).data('id');
        $('#essayResultDetailsTbl').DataTable({
            "destroy": true,
            "lengthMenu": [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
            "ajax": {
                    "url": '/essay_result_details/',
                    "data": {'test_id': function() {
                            return test_id;
                          }},
                    "dataSrc": function ( json ) {
                            return json;
                        }
                  },
            "columns": [
                { "data": "ques_sl_no" },
                { "data": "ques" },
                { "data": "actual_marks" },
                { "data": "user_answer" },
                { "data": "gained_marks" },
                { "data": "suggestions" }
            ],
            "columnDefs": [{
                "orderable":false, "targets": [1,2,3,4,5]
            }],
            "createdRow": function ( row, data, index ) {
                $('td', row).eq(5).css('color', 'red');
            }
        });
        $('#resultDetailModal').modal('show');
    });

    function up_resultTestType(){
        $.ajax({
            url: "/test_type/",
            type: "GET",
            dataType:"JSON",
            success: function(response) {
                $("#resultTestType").find('option').not(':first').remove();
                if(response.length!=0){
                    $.each(response.results,function(index,row){
                        $("#resultTestType")
                        .append(
                            $("<option></option>")
                                .text(row.test_type_name)
                                .val(row.test_type_id)
                        );
                    });
                }
            }
        });
    }
});