$(document).ready(function() {
    $('#essayExamLink').on('click',function(){
        var $this = $(this);
        if($this.data('clicked')) {
            resetUPEssayExam();
        }
        else {
            $this.data('clicked', true);
                $.ajax({
                url: "/subject_list/",
                type: "GET",
                dataType:"JSON",
                success: function(response) {
                    $("#essayExamSubjectList").find('option').not(':first').remove();
                    if(response.length!=0){
                        $.each(response.results,function(index,row){
                            //$.each(row, function(k, v){
                                //console.log(v.subject_id);
                                $("#essayExamSubjectList")
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

    $('#essayExamSubjectList').on('change',function(){
        $('#essayTestStartBtn').prop('disabled',false);
        $.ajax({
            url: "/test_info_list/",
            type: "GET",
            data: {'subject_id':$('#essayExamSubjectList').val(),
                    'test_type':2},
            success: function(newData){
                $('.essayQuesController').html(newData);
            }
        });
        getTestID();
    });
    
    $('#essayTestStartBtn').on('click',function(){
        var essayExamTest_id = $(this).data('test');
        var essayExamTest_time = $(this).data('time');
        var collapseID=essayExamTest_id.toString().substring(3, 5)
        var prevCollapseID=essayExamTest_id.toString().substring(3, 5)=='01'?'01':(essayExamTest_id-10).toString().substring(3, 5);
        $.ajax({
            url: "/essay_ques_info/",
            type: "GET",
            data: {'test_id':essayExamTest_id},
            success: function(newData){
                $('#collapse'+collapseID).find('.owl-dots').attr('id','customDots');
                $('.essayExamQuesList').html(newData);
                $('#collapse'+prevCollapseID).collapse('hide');
                $('#collapse'+collapseID).collapse('show');
                $('#heading'+collapseID).css("background-color", "#F0AD4E");
                $('#heading'+prevCollapseID).css("background-color", "#6699FF");
                $('#mcqExamTimer').data('timer', (essayExamTest_time*60));
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
                        var time=(((essayExamTest_time*60)-($('#mcqExamTimer').TimeCircles().getTime()))/60).toFixed(2);
                        $('#mcqExamTimer').TimeCircles().destroy();
                        get_ans_submit(time);
                    }
                });
            }
        });
        $.ajax({
            url: "/get_essay_summary/",
            type: "GET",
            data: {'test_id':essayExamTest_id},
            success: function(response){
                summary=(response.summaryInfo[0]['essay_summary_details']);
                summary=summary.replace(/\n/g, "<br />");
                $('.essayExamQuesSummary').html(summary);
                moreContent();
            }
        });
    });

    function getTestID(){
        $.ajax({
            url: "/user_test_id/",
            type: "GET",
            data: {'subject_id':$('#essayExamSubjectList').val(),
                    'test_type':2,
                    'user_id':$('#profileUserID').html()},
            dataType:"JSON",
            success: function(response) {
                if(response.status==3){
                    swal("Success!", "Congratulations you have passed all in this subject!", "success");
                    resetUPEssayExam();
                }
                else if(response.status==4){
                    statText = statText='Your previous paper is not reviewed yet!'+
                     ' Please wait to be reviewed and proceed to the next test!';
                    swal("Error!", statText, "error");
                    resetUPEssayExam();
                }
                else if(response.status==5){
                    swal("Error!", "Tests are not set yet for this subject!", "error");
                    resetUPEssayExam();
                }
                else if(response.status==6){
                    swal("Error!", "Test Questions are not set yet for this subject!", "error");
                    resetUPEssayExam();
                }
                else{
                    $('#essayTestStartBtn').data('test',response.examTestID);
                    $('#essayTestStartBtn').data('time',response.test_time);
                }
            }
        });
    }

    $('#essayAnsSubmitBtn').on('click',function(){
        var time=((($('#mcqExamTimer').data('timer'))-($('#mcqExamTimer').TimeCircles().getTime()))/60).toFixed(2);
        console.log(time);
        get_ans_submit(time);
    });

    function get_ans_submit(time){
        usedTime=time;
        userID=$('#profileUserID').html();
        var val = [];
        $(".essayAns").each(function(){
            var row={};
            if($(this).val()){
                row['ques'] =  $(this).data("qid");
                row['ans'] = $(this).val();
                val.push(row);
            }
        });
        console.log(val);
        $.ajax({
            url: "/essay_ans_submit/",
            type: "POST",
            data: {obj:JSON.stringify(val),
            'csrfmiddlewaretoken' : $("input[name=csrfmiddlewaretoken]").val(),
            'test_id':$('#essayTestStartBtn').data('test'),
            'user_id':userID,
            'usedTime':usedTime},
             dataType:"JSON",
            success: function(response) {
                //console.log(response);
                console.log(response.status);
                if(response.status=='1'){
                    statText='Your answers successfully submitted to our review board!'+
                     ' It will take 5-10 Hours to complete the review. To see the result go to the result board!';
                    swal("Success!", statText, "success");
                    resetUPEssayExam();
                }
                else{
                    swal("Error!", "Something Wrong!", "error");
                    resetUPEssayExam();
                }
            }
        });
    }

	function moreContent(){
	    var showChar = 250;
        var ellipsestext = "...";
        var moretext = "more";
        var lesstext = "less";
        var content = $('.essayExamQuesSummary').html();
        if(content.length > 250) {
            var c = content.substr(0, showChar);
            var h = content.substr(showChar, content.length - showChar);
            var html = c + '<span class="moreellipses">' + ellipsestext+ '&nbsp;</span><span class="morecontent"><span>' + h + '</span></span>'+
                        '<a href="" class="morelink">' + moretext + '</a>';
            $('.essayExamQuesSummary').html(html);
        }
        $(".morelink").on('click', function(e){
            e.preventDefault();
            if($(this).hasClass("less")) {
                $(this).removeClass("less");
                $('.moreellipses').show();
                $(this).html(moretext);
            } else {
                $(this).addClass("less");
                $('.moreellipses').hide();
                $(this).html(lesstext);
            }
            $(this).parent().prev().toggle();
            $(this).prev().toggle();
            return false;
        });
	}

	function resetUPEssayExam(){
	    $('.essay_carousel').owlCarousel('destroy');
        $('#essayAnsSubmitBtn').prop('disabled',true);
        $('#essayAnsSubmitBtn').addClass('hidden');
        $('#mcqExamTimer').TimeCircles().destroy();
        $('.essayQuesController').html("");
        $('.essayExamQuesSummary').html("");
        $("select").prop('selectedIndex',0);
        $('#essayTestStartBtn').prop('disabled',true);
	}
 });