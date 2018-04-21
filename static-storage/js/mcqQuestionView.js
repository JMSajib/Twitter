$(document).ready(function(){
    $(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);
    //$(document).ajaxStart($.blockUI({ message: $('#throbber') })).ajaxStop($.unblockUI);
    $('#mcqQuesEditTbl').hide();
    $('#mcqSubmitBtn').prop('disabled',true);

    $('#mcqLink').on('click',function(){
        $.ajax({
            url: "/subject_list/",
            type: "GET",
            dataType:"JSON",
            success: function(response) {
                //console.log(response);
                $("#mcqSubjectList").find('option').not(':first').remove();
                if(response.length!=0){
                    $.each(response.results,function(index,row){
                        //$.each(row, function(k, v){
                            //console.log(v.subject_id);
                            $("#mcqSubjectList")
                            .append(
                                $("<option></option>")
                                    .text(row.subject_id+':'+row.subject_name)
                                    .val(row.subject_id)
                            );
                        //});
                    });
                }
            }
        });
    });
    $('#mcqSubjectList').on('change',function(){
        $("#mcqQuesTbl").find('tr').not(':first').remove();
        $("#mcqTestList").prop('selectedIndex',0);
        //console.log("Test");
        $.ajax({
            url: "/test_list/",
            type: "GET",
            data: {'subject_id':$('#mcqSubjectList').val(),
                   'test_type':1},
            dataType:"JSON",
            success: function(response) {
                var data=response;
                $("#mcqTestList").find('option').not(':first').remove();
                if(response.length!=0){
                    $.each(response,function(index,row){
                        $.each(row, function(k, v){
                            $("#mcqTestList")
                            .append(
                                $("<option></option>")
                                    .text(v.test_id.toString().substring(3, 5)+': '+v.test_name)
                                    .val(v.test_id)
                            );
                        });
                    });
                }
            }
        });
    });

    $('#mcqTestList').on('change',function(){
        $("#mcqQuesTbl").find('tr').not(':first').remove();
        $.ajax({
            url: "/test_info/",
            type: "GET",
            data: {'subject_id':$('#mcqSubjectList').val(),
                   'test_type':1,
                   'test_id' : $('#mcqTestList').val()},
            dataType:"JSON",
            success: function(response) {
                $('#mcqMaxQuesNo').text(response.results[0].test_total_questions);
                $('#mcqExamTime').text(response.results[0].test_totaltimes+" mins");
                $('#mcqTotalMarks').text(response.results[0].test_totalmarks);
                //mcq_available_check();
                get_mcq_ques_data();
            }
        });
    });

    $('#mcqQuesSubBtn').on('click',function(){
        $('#mcqSubjectList').prop('disabled',true);
        $('#mcqTestList').prop('disabled',true);
        $('#mcqQuesTbl').show();
        $('#mcqQuesEditTbl').hide();
        $('#mcqSubmitBtn').prop('disabled',false);
        $("#mcqQuesTbl").find('tr').not(':first').remove();
        var quesLimit=$("#mcqMaxQuesNo").text();
        var trHTML = '';
        for(var i=1;i<=quesLimit;i++){
            trHTML+= '<tr id='+i+'><td><span>'+i+'</span><input type="text" class="form-control hidden" id="qid" name="qid" value="'+i+'"></td>'+
//            '<td><input type="text" class="form-control" id="ques" name="ques" placeholder="Question"></td>'+
            '<td><textarea class="form-control vresize quesTest" id="ques" name="ques" placeholder="Question"></textarea></td>'+
            '<td><textarea class="form-control vresize" id="option1" name="option1" placeholder="Option 1"></textarea></td>'+
            '<td><textarea class="form-control vresize" id="option2" name="option2" placeholder="Option 2"></textarea></td>'+
            '<td><textarea class="form-control vresize" id="option3" name="option3" placeholder="Option 3"></textarea></td>'+
            '<td><textarea class="form-control vresize" id="option4" name="option4" placeholder="Option 4"></textarea></td>'+
            /*'<td><input type="text" class="form-control" id="option1" name="option1" placeholder="Option 1"></td>'+
            '<td><input type="text" class="form-control" id="option2" name="option2" placeholder="Option 2"></td>'+
            '<td><input type="text" class="form-control" id="option3" name="option3" placeholder="Option 3"></td>'+
            '<td><input type="text" class="form-control" id="option4" name="option4" placeholder="Option 4"></td>'+*/
            //'<td><input type="text" class="form-control" id="rightAnswer" name="rightAnswer" placeholder="Right Answer" required></td></tr>';
            '<td><select class="form-control rightAnswer" name="rightAnswer"></select></td></tr>';
        }
        $('#mcqQuesTbl').append(trHTML);
        getRightAnsOptions();
    });


    var mcqForm = $( "#mcqSectionForm" );
    mcqForm.validate();

    $('#mcqSubmitBtn').on('click',function(){
        if(mcqForm.valid()) {
            var data=[];
            $('#mcqQuesTbl').find('tr:not(:has(th))').each(function(){
                var id=$(this).attr('id');
                var row={};
                $(this).find('textarea, :input').each(function(){
                    row[$(this).attr('name')]=$(this).val();
                });
                data.push(row);
            });
            console.log(data);
            if (data.length === 0) {
                swal("Error!", "Please generate the form!", "error");
            }
            else{
                $.ajax({
                    url: "/mcq_paper_submit/",
                    type: "POST",
                    data: {obj:JSON.stringify(data),
                    'csrfmiddlewaretoken' : $("input[name=csrfmiddlewaretoken]").val(),
                    'test_id':$('#mcqTestList').val()},
                    dataType:"JSON",
                    success: function(response) {
                        //console.log(response);

                        console.log(response.status);
                        if(response.status=='1'){
                            swal("Success!", "Successfully Submitted!", "success");
                            resetMCQQuesSection();
                        }
                        else{
                            swal("Error!", "Something Wrong!", "error");
                            resetMCQQuesSection();
                        }
                    }
                });
            }
        }
    });

    function mcq_available_check(){
        $('#mcqSubmitBtn').prop('disabled',true);
        $.ajax({
            url: "/mcq_available_check/",
            type: "GET",
            data: {'test_id':$('#mcqTestList').val()},
            dataType:"JSON",
            success: function(response) {
                if(response){
                    $("#mcqQuesEditTbl").find('tr').not(':first').remove();
                    var trHTML = '';
                    $.each(response, function (key,value) {
                        trHTML +='<tr data-id="'+value.mcq_question_id+'" data-ques="'+value.mcq_question+'" data-option1="'+value.mcq_option1+'" data-option2="'+value.mcq_option2+'" data-option3="'+value.mcq_option3+'" data-option4="'+value.mcq_option4+'" data-ans="'+value.mcq_right_answer+'">'+
                        '<td data-id="'+value.mcq_question_id+'">' + value.mcq_question_id +'</td>'+
                        '<td>' + value.mcq_question.replace(/\n/g, "<br />") +'</td>'+
                        '<td>' + value.mcq_option1 +'</td>'+
                        '<td>' + value.mcq_option2 +'</td>'+
                        '<td>' + value.mcq_option3 +'</td>'+
                        '<td>' + value.mcq_option4 +'</td>'+
                        '<td>' + value.mcq_right_answer +'</td></tr>';
                    });
                    $('#mcqQuesEditTbl').append(trHTML);
                }
            }
        });
    }

    $('#mcqQuesEditTbl').on('click','tr', function(){
        $('#quesEditModal').modal('show');
        $('#quesIDEdit').val($(this).attr("data-id"));
        $('#mcqQuesEdit').val($(this).attr("data-ques"));
        $('#mcqOptionOneEdit').val($(this).attr("data-option1"));
        $('#mcqOptionTwoEdit').val($(this).attr("data-option2"));
        $('#mcqOptionThreeEdit').val($(this).attr("data-option3"));
        $('#mcqOptionFourEdit').val($(this).attr("data-option4"));
        $('#mcqRightAnswerEdit').val($(this).attr("data-ans"));
    });

    $('#mcqQuesEditBtn').on('click',function(){
        $.unblockUI();
        $('#quesEditModal').modal('hide');
        $.ajax({
            url: "/mcq_ques_edit/",
            type: "GET",
            data: {'test_id': $('#mcqTestList').val(),
                    'mcq_ques_id': $('#quesIDEdit').val(),
                    'mcq_ques': $('#mcqQuesEdit').val(),
                    'mcq_option1': $('#mcqOptionOneEdit').val(),
                    'mcq_option2': $('#mcqOptionTwoEdit').val(),
                    'mcq_option3': $('#mcqOptionThreeEdit').val(),
                    'mcq_option4': $('#mcqOptionFourEdit').val(),
                    'mcq_answer': $('#mcqRightAnswerEdit').val()
                    },
            dataType:"JSON",
            success: function(response) {
                if(response.status==1){
                    swal("Success!", "Successfully Updated!", "success");
                    mcq_available_check();
                }
                else{
                    swal("Error!", "Something Wrong!", "error");
                }
            }
        });
    });

    function get_mcq_ques_data(){
        $.ajax({
            url: "/get_mcq_ques_data/",
            type: "GET",
            data: {'test_id': $('#mcqTestList').val()},
            dataType:"JSON",
            success: function(response) {
                //console.log(response.status);
                if(response.status==0){
                    $('#mcqEditBtn').prop('disabled',true);
                    $('#mcqQuesSubBtn').prop('disabled',false);
                }
                else{
                    $('#mcqEditBtn').prop('disabled',false);
                    $('#mcqQuesSubBtn').prop('disabled',true);
                }
            }
        });
    }

    $('#mcqEditBtn').on('click',function(){
        $('#mcqQuesEditTbl').show();
        $('#mcqQuesTbl').hide();
        $('#mcqSubjectList').prop('disabled',true);
        $('#mcqTestList').prop('disabled',true);
        mcq_available_check();
    });

    function getRightAnsOptions(){
        $('.rightAnswer').each(function(index,row){
            for(var i=1; i<= 4; i++){
                 $(this).append($("<option></option>").text(i).val(i));
            }
        });
    }

    /*$('#resetBtn').on('click',function(){
        resetTestSection();
        enable();
        $('#quesNo').text("");
        $("#totalMarks").prop('readonly',true);
        $("#submitTestBtn").prop('disabled',false);
        $("#editTestBtn").prop('disabled',true);
    });*/

    function resetMCQQuesSection(){
        var validator = $( "#mcqSectionForm" ).validate();
        validator.resetForm();
        $("input[type=text]").val("");
        $("textarea").val("");
        $("select").prop('selectedIndex',0);
        $(":input").closest('.form-group').removeClass('has-success');
        $("#mcqQuesTbl tbody>tr").remove();
        $("#mcqQuesEditTbl tbody>tr").remove();
        $('#mcqMaxQuesNo').text('');
        $('#mcqExamTime').text('');
        $('#mcqTotalMarks').text('');
        $('#mcqSubjectList').prop('disabled',false);
        $('#mcqTestList').prop('disabled',false);
        $('#mcqSubmitBtn').prop('disabled',true);
    }

    $('#mcqResetBtn').on('click',function(){
        resetMCQQuesSection();
        $('#mcqEditBtn').prop('disabled',true);
        $('#mcqQuesSubBtn').prop('disabled',true);
    });

});
