$(document).ready(function(){
    $(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);
    $('#essayQuesEditTbl').hide();
    $('#essaySubmitBtn').prop('disabled',true);

    $('#essayLink').on('click',function(){
        $.ajax({
            url: "/subject_list/",
            type: "GET",
            dataType:"JSON",
            success: function(response) {
                //console.log(response);
                $("#essaySubjectList").find('option').not(':first').remove();
                if(response.length!=0){
                    $.each(response.results,function(index,row){
                        //$.each(row, function(k, v){
                            //console.log(v.subject_id);
                            $("#essaySubjectList")
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

    $('#essaySubjectList').on('change',function(){
        $("#essayQuesTbl").find('tr').not(':first').remove();
        $("#essayTestList").prop('selectedIndex',0);
        //console.log("Test");
        $.ajax({
            url: "/test_list/",
            type: "GET",
            data: {'subject_id':$('#essaySubjectList').val(),
                   'test_type':2},
            dataType:"JSON",
            success: function(response) {
                var data=response;
                $("#essayTestList").find('option').not(':first').remove();
                if(response.length!=0){
                    $.each(response,function(index,row){
                        $.each(row, function(k, v){
                            $("#essayTestList")
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

    $('#essayTestList').on('change',function(){
      $("#essayQuesTbl").find('tr').not(':first').remove();
        $.ajax({
            url: "/test_info/",
            type: "GET",
            data: {'subject_id':$('#essaySubjectList').val(),
                   'test_type':2,
                   'test_id' : $('#essayTestList').val()},
            dataType:"JSON",
            success: function(response) {
                $('#essayMaxQuesNo').text(response.results[0].test_total_questions);
                $('#essayExamTime').text(response.results[0].test_totaltimes+" mins");
                $('#essayTotalMarks').val(response.results[0].test_totalmarks);
                //mcq_available_check();
                get_essay_ques_data();
            }
        });
    });

    $('#essayQuesSubBtn').on('click',function(){
        $('#essaySubjectList').prop('disabled',true);
        $('#essayTestList').prop('disabled',true);
        $('#essayQuesTbl').show();
        $('#essayQuesEditTbl').hide();
        $('#essaySubmitBtn').prop('disabled',false);
        $("#essayQuesTbl").find('tr').not(':first').remove();
        var quesLimit=$("#essayMaxQuesNo").text();
        var trHTML = '';
        for(var i=1;i<=quesLimit;i++){
            trHTML+= '<tr id='+i+'><td><span>'+i+'</span><input type="text" class="form-control hidden" id="qid" name="qid" value="'+i+'"></td>'+
            '<td><textarea class="form-control vresize ques" name="ques" placeholder="Question" required></textarea></td>'+
            /*'<td><input type="text" class="form-control" id="ques" name="ques" placeholder="Question"></td>'+
            '<td><input type="text" class="form-control" id="mark" name="mark" placeholder="Mark"></td>';*/
            '<td><select class="form-control mark" name="mark"></select></td></tr>';
        }
        $('#essayQuesTbl').append(trHTML);
        getMarkOptions();
    });

    var essayForm = $( "#essaySectionForm" );
    essayForm.validate();

    $('#essaySubmitBtn').on('click',function(){
        //$("#essaySectionForm").validate();
        if(essayForm.valid()) {
            var data=[];
            $('#essayQuesTbl').find('tr:not(:has(th))').each(function(){
                var id=$(this).attr('id');
                var row={};
                $(this).find(':input').each(function(){
                    row[$(this).attr('name')]=$(this).val();
                });
                data.push(row);
            });
            console.log(data);
            $.ajax({
                url: "/essay_paper_submit/",
                type: "POST",
                data: {obj:JSON.stringify(data),
                'csrfmiddlewaretoken' : $("input[name=csrfmiddlewaretoken]").val(),
                'test_id':$('#essayTestList').val(),
                'essay_summary':$('#essaySummary').val(),
                'essay_total_marks':$('#essayTotalMarks').val()},
                dataType:"JSON",
                success: function(response) {
                    //console.log(response);
                    console.log("Test");
                    if(response.status==1){
                        swal("Success!", "Successfully Updated!", "success");
                        resetEssayQuesSection();
                    }
                    else{
                        swal("Error!", "Something Wrong!", "error");
                        resetEssayQuesSection();
                    }
                }
            });
        }

    });

    function essay_available_check(){
        $('#essaySubmitBtn').prop('disabled',true);
        $.ajax({
            url: "/essay_available_check/",
            type: "GET",
            data: {'test_id':$('#essayTestList').val()},
            dataType:"JSON",
            success: function(response) {
                if(response){
                    $('#essaySummary').readonly();
                    $("#essayQuesEditTbl").find('tr').not(':first').remove();
                    var trHTML = '';
                    $.each(response, function (key,value) {
                        trHTML +='<tr data-id="'+value.essay_question_id+'" data-ques="'+value.essay_question+'" data-marks="'+value.essay_question_marks+'">'+
                        '<td data-id="'+value.essay_question_id+'">' + value.essay_question_id +'</td>'+
                        '<td>' + value.essay_question +'</td>'+
                        '<td>' + value.essay_question_marks +'</td></tr>';
                    });
                    $('#essayQuesEditTbl').append(trHTML);
                }
            }
        });
    }

    $('#essayQuesEditTbl').on('click','tr', function(){
        $('#essayEditModal').modal('show');
        $('#essayQuesIDEdit').val($(this).attr("data-id"));
        $('#essayQuesEdit').val($(this).attr("data-ques"));
        $('#questionMarkEdit').val($(this).attr("data-marks"));
        $('#questionMarkEdit').readonly();
    });

    $('#essayQuesEditBtn').on('click',function(){
        $.unblockUI();
        $('#essayEditModal').modal('hide');
        $.ajax({
            url: "/essay_ques_edit/",
            type: "GET",
            data: {'test_id': $('#essayTestList').val(),
                    'essay_ques_id': $('#essayQuesIDEdit').val(),
                    'essay_ques': $('#essayQuesEdit').val(),
                    'essay_question_marks': $('#questionMarkEdit').val(),
                    },
            dataType:"JSON",
            success: function(response) {
                if(response.status==1){
                    swal("Success!", "Successfully Updated!", "success");
                    essay_available_check();
                }
                else{
                    swal("Error!", "Something Wrong!", "error");
                }
            }
        });
    });


    function get_essay_ques_data(){
        $.ajax({
            url: "/get_essay_ques_data/",
            type: "GET",
            data: {'test_id': $('#essayTestList').val()},
            dataType:"JSON",
            success: function(response) {
                //console.log(response.status);
                if(response.status==0){
                    $('#essayEditBtn').prop('disabled',true);
                    $('#essayQuesSubBtn').prop('disabled',false);
                }
                else{
                    $('#essaySummary').val(response.results[0].essay_summary_details);
                    $('#essaySummary').readonly();
                    $('#summaryEdit').removeClass('hidden');
                    $('#essayEditBtn').prop('disabled',false);
                    $('#essayQuesSubBtn').prop('disabled',true);
                    $('#essaySubjectList').prop('disabled',true);
                    $('#essayTestList').prop('disabled',true);
                }
            }
        });
    }

    $('#essayEditBtn').on('click',function(){
        $('#essayQuesEditTbl').show();
        $('#essayQuesTbl').hide();
        $('#essaySubjectList').prop('disabled',true);
        $('#essayTestList').prop('disabled',true);
        $('#essaySummary').readonly();
        essay_available_check();
    });
    function getMarkOptions(){
        $('.mark').each(function(index,row){
            for(var i=1; i<= 10; i++){
                 $(this).append($("<option></option>").text(i).val(i));
            }
        });
    }

    function resetEssayQuesSection(){
        var validator = $( "#essaySectionForm" ).validate();
        validator.resetForm();
        $("input[type=text]").val("");
        $("textarea").val("");
        $("select").prop('selectedIndex',0);
        $(":input").closest('.form-group').removeClass('has-success');
        $("#essayQuesTbl tbody>tr").remove();
        $("#essayQuesEditTbl tbody>tr").remove();
        $('#essayMaxQuesNo').text('');
        $('#essayExamTime').text('');
        $('#essayTotalMarks').val('');
        $('#essaySubjectList').prop('disabled',false);
        $('#essayTestList').prop('disabled',false);
        $('#essaySubmitBtn').prop('disabled',true);
        $('#essaySummary').readonly(false);
    }

    $('#essayResetBtn').on('click',function(){
        resetEssayQuesSection();
        $('#essayEditBtn').prop('disabled',true);
        $('#essayQuesSubBtn').prop('disabled',true);
    });

    var oldSummaryText;
    $('#summaryEdit').on('click',function(){
        $('#essaySummary').readonly(false);
        $(this).addClass('hidden');
        $('#summaryEditDone').removeClass('hidden');
        $('#summaryEditCancel').removeClass('hidden');
        oldSummaryText = $('#essaySummary').val();
    });

    $('#summaryEditCancel').on('click',function(){
        $('#essaySummary').readonly(true);
        $(this).addClass('hidden');
        $('#summaryEdit').removeClass('hidden');
        $('#summaryEditDone').addClass('hidden');
        $('#essaySummary').val(oldSummaryText);
    });

    $('#summaryEditDone').on('click',function(){
        $('#essaySummary').readonly();
        $(this).addClass('hidden');
        $('#summaryEdit').removeClass('hidden');
        $('#summaryEditCancel').addClass('hidden');
        $.ajax({
            url: "/essay_summary_edit/",
            type: "GET",
            data: {'test_id': $('#essayTestList').val(),
            'essay_summary':$('#essaySummary').val()},
            dataType:"JSON",
            success: function(response) {
                if(response.status==1){
                    swal("Success!", "Successfully Updated!", "success");
                }
                else{
                    swal("Error!", "Something Wrong!", "error");
                }
            }
        });
    });

    sum=0;
    $(document).on("blur", ".mark", function(){
        /*sum=sum+parseInt($(this).val());
        $('#reviewTotalMarks').val(sum);*/
        var sum = 0;
        $('.mark').each(function() {
            sum += Number($(this).val());
        });
        $('#essayTotalMarks').val(sum);
    });

});
