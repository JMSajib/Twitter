$(document).ready(function(){
    $('#mcqExamLink').on('click',function(){
        var $this = $(this);
        if($this.data('clicked')) {
            resetUPMCQExam();
        }
        else {
            $this.data('clicked', true);
            $.ajax({
                url: "/subject_list/",
                type: "GET",
                dataType:"JSON",
                success: function(response) {
                    $("#mcqExamSubjectList").find('option').not(':first').remove();
                    if(response.length!=0){
                        $.each(response.results,function(index,row){
                            //$.each(row, function(k, v){
                                //console.log(v.subject_id);
                                $("#mcqExamSubjectList")
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
        }

    });
    function getTestID(){
        $.ajax({
            url: "/user_test_id/",
            type: "GET",
            data: {'subject_id':$('#mcqExamSubjectList').val(),
                    'test_type':1,
                    'user_id':$('#profileUserID').html()},
            dataType:"JSON",
            success: function(response) {
                if(response.status==3){
                    swal("Success!", "Congratulations you have passed all in this subject!", "success");
                    resetUPMCQExam();
                }
                else if(response.status==5){
                    swal("Error!", "Tests are not set yet for this subject!", "error");
                    resetUPMCQExam();
                }
                else if(response.status==6){
                    swal("Error!", "Test Questions are not set yet for this subject!", "error");
                    resetUPMCQExam();
                }
                else{
                    $('#mcqTestStartBtn').data('test',response.examTestID);
                    $('#mcqTestStartBtn').data('time',response.test_time);
                }
            }
        });
    }
    $('#mcqExamSubjectList').on('change',function(){
        $('#mcqTestStartBtn').prop('disabled',false);
        $.ajax({
            url: "/test_info_list/",
            type: "GET",
            data: {'subject_id':$('#mcqExamSubjectList').val(),
                    'test_type':1},
            success: function(newData){
                $('.mcqQuesController').html(newData);
            }
        });
        getTestID();
    });

    $('#mcqTestStartBtn').on('click',function(){
        var mcqExamTest_id = $(this).data('test');
        console.log(mcqExamTest_id);
        var mcqExamTest_time = $(this).data('time');
        var collapseID=mcqExamTest_id.toString().substring(3, 5)
        var prevCollapseID=mcqExamTest_id.toString().substring(3, 5)=='01'?'01':(mcqExamTest_id-10).toString().substring(3, 5);
        if(!mcqExamTest_id){
            swal("Success!", "Congratulations you have passed all in this subject!", "success");
            resetUPMCQExam();
        }
        else{
            $.ajax({
                url: "/ques_info/",
                type: "GET",
                data: {'test_id':mcqExamTest_id},
                success: function(newData){
                    $('#collapse'+collapseID).find('.owl-dots').attr('id','customDots');
                    $('.mcqExamQuesList').html(newData);
                    $('#collapse'+prevCollapseID).collapse('hide');
                    $('#collapse'+collapseID).collapse('show');
                    $('#heading'+collapseID).css("background-color", "#F0AD4E");
                    $('#heading'+prevCollapseID).css("background-color", "#6699FF");
                    $('#mcqExamTimer').data('timer', (mcqExamTest_time*60));
                    $('#accordion').on('shown.bs.collapse', function () {
                        var openPanel = $(this).find('.in').parents('.panel');
                        openPanel.prependTo('#accordion');
                    });
                    $("#mcqExamTimer").TimeCircles(
                        { time: {
                            Days: { show: false },
                            Hours: { color: "#581845" },
                            Minutes: { color: "#900C3F" },
                            Seconds: { color: "#FF1493" }
                        },circle_bg_color: "#E6E6E6"}
                    ).addListener(function(unit, value, total) {
                        if(total==120){
                            swal({
                                position: 'top-right',
                                type: 'warning',
                                title: 'Hurry up!!! 2 minutes left!!!',
                                showConfirmButton: false,
                                timer: 2500,
                                toast:true
                            });
                        }
                        if(total <= 0){
                            var time=(((mcqExamTest_time*60)-($('#mcqExamTimer').TimeCircles().getTime()))/60).toFixed(2);
                            $('#mcqExamTimer').TimeCircles().destroy();
                            get_ans_submit(time);
                        }
                    });
                }
            });
        }
    });

    $('#mcqAnsSubmitBtn').on('click',function(){
        var time=((($('#mcqExamTimer').data('timer'))-($('#mcqExamTimer').TimeCircles().getTime()))/60).toFixed(2);
        console.log(time);
        get_ans_submit(time);
    });

    function get_ans_submit(time){
        usedTime=time;
        userID=$('#profileUserID').html();
        var val = [];
        $('.item input:checked').each(function(){
            var row={};
            $(this).each(function(i){
                row['ques'] =  $(this).data("qid");
                row['ans'] = $(this).val();
            });
            val.push(row);
        });
        //console.log(val);
        $.ajax({
            url: "/mcq_ans_submit/",
            type: "POST",
            data: {obj:JSON.stringify(val),
            'csrfmiddlewaretoken' : $("input[name=csrfmiddlewaretoken]").val(),
            'test_id':$('#mcqTestStartBtn').data('test'),
            'user_id':userID},
            dataType:"JSON",
            success: function(response) {
                //console.log(response);
                //console.log(response.status);
                if(response.status=='1'){
                    //swal("Success!", "Successfully Inserted!", "success");
                    get_user_result(usedTime);
                }
                else{
                    swal("Error!", "Something Wrong!", "error");
                }
            }
        });
    }
    function get_user_result(usedTime){
        userID=$('#profileUserID').html();
        $.ajax({
            url: "/get_user_result/",
            type: "GET",
            data: {'test_id':$('#mcqTestStartBtn').data('test'),
                    'user_id':userID,
                    'usedTime':usedTime},
            dataType:"JSON",
            success: function(response) {
                if(response.result_list[0] != null){
                    $('#mcqTestStartBtn').data('test',response.result_list[0].next_test_id);
                    $('#mcqTestStartBtn').data('time',response.result_list[0].test_time);
                    passStatus=response.result_list[0].result_status==1?'Passed':'Failed';
                    statText='<table class="table"><tr><td>Correct Answer: </td><td>'+response.result_list[0].gained_marks+'</td></tr>'+
                             '<tr><td>Wrong Answer: </td><td>'+(response.result_list[0].total_marks-response.result_list[0].gained_marks)+'</td></tr>'+
                             '<tr><td>Percentage: </td><td>'+response.result_list[0].gained_percentage+'</td></tr>'+
                             '<tr><td>Status: </td><td>'+passStatus+'</td></tr></table>';
                    if(response.result_list[0].result_status==0){
                        swal({
                            title: 'Please try again!!!',
                            type: 'error',
                            html: statText,
                            showCloseButton: true,
                        });
                        $('#user_mcqExamStats_Score').html(response.result_list[0].gained_marks);
                        $('#user_mcqExamStats_Status').html(passStatus).css('color', 'red');
                        $('.mcq_carousel').owlCarousel('destroy');
                        $('#mcqAnsSubmitBtn').prop('disabled',true);
                        $('#mcqAnsSubmitBtn').addClass('hidden');
                        $('#mcqExamTimer').TimeCircles().destroy();
                    }
                    else{
                        swal({
                            title: 'Congratulations!!!',
                            type: 'success',
                            html: statText,
                            showCloseButton: true,
                        });
                        $('#user_mcqExamStats_Score').html(response.result_list[0].gained_marks);
                        $('#user_mcqExamStats_Status').html(passStatus).css('color', 'green');
                        $('.mcq_carousel').owlCarousel('destroy');
                        $('#mcqAnsSubmitBtn').prop('disabled',true);
                        $('#mcqAnsSubmitBtn').addClass('hidden');
                        $('#mcqExamTimer').TimeCircles().destroy();
                    }
                }
                else{
                    swal("Success!", "Congratulations you have passed all in this subject!", "success");
                    $('#mcqTestStartBtn').data('test','');
                    $('#mcqTestStartBtn').data('time','');
                    resetUPMCQExam();
                }
            }
        });
    }

    function resetUPMCQExam(){
        $('.mcq_carousel').owlCarousel('destroy');
        $('#mcqAnsSubmitBtn').prop('disabled',true);
        $('#mcqAnsSubmitBtn').addClass('hidden');
        $('#mcqExamTimer').TimeCircles().destroy();
        $('.mcqQuesController').html("");
        $("select").prop('selectedIndex',0);
        $('#mcqTestStartBtn').prop('disabled',true);
    }

});
