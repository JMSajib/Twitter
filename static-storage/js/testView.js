$(document).ready(function(){
    $('#editTestBtn').prop('disabled',true);
    $('#testLink').on('click',function(){
        getTestType();
        $.ajax({
            url: "/subject_list/",
            type: "GET",
            dataType:"JSON",
            success: function(response) {
                var data=response;
                $("#subjectList").find('option').not(':first').remove();
                $("#totalTime").find('option').not(':first').remove();
                if(response.length!=0){
                    $.each(response.results,function(index,row){
                        //$.each(row, function(k, v){
                            $("#subjectList")
                            .append(
                                $("<option></option>")
                                    .text(row.subject_id+':'+row.subject_name)
                                    .val(row.subject_id)
                            );
                        //});
                    });
                    $('#subjectList').on('change',function(){
                        $('#testTypeList').prop('selectedIndex',0);
                        var subjectID = $('#subjectList').val();
                        var returnedData = $.grep(data.results, function(element, index){
                            return (element.subject_id == subjectID);
                        });
                        $('#mcq_tt').val(returnedData[0].mcq_total_test);
                        $('#essay_tt').val(returnedData[0].essay_total_test);
                    });
                    $.each(response.total_timeList,function(index,row){
                        $("#totalTime")
                        .append(
                            $("<option></option>")
                                .text(row.test_time+' mins')
                                .val(row.test_time)
                        );
                    });
                }
            }
        });
    });
    $('#testTypeList').on('change',function(){
        $('#totalMarks').val("");
        $('#testTotalQues').prop('selectedIndex',0);
        var subjectID = $('#subjectList').val();
        var testTypeID = $('#testTypeList').val();
        var mcq_tt=$('#mcq_tt').val();
        var essay_tt=$('#essay_tt').val();
        $("#testIDList").find('option').not(':first').remove();
        if(testTypeID==1){
            for(var i=1; i<=mcq_tt;i++){
                var testNum=$.trim(i).length === 1 ? '0' + i : i;
                $("#testIDList").append($("<option></option>").text('Test: ' +testNum).val(subjectID+testNum+testTypeID));
            }
        }
        else{
            for(var i=1; i<=essay_tt;i++){
                var testNum=$.trim(i).length === 1 ? '0' + i : i;
                $("#testIDList").append($("<option></option>").text('Test: ' +testNum).val(subjectID+testNum+testTypeID));
            }
        }
        getTestQuesNo(testTypeID);
    });
    $('#testTotalQues').on('change',function(){
        var test_type=$('#testTypeList').val();
        if(test_type=='1'){
            $('#totalMarks').val($('#testTotalQues').val());
        }
        else if(test_type=='2'){
            $('#totalMarks').val(0);
        }
        else{
            swal("Error!", "Please select test type first!", "error");
        }
        //$('#quesNo').html($('#testTotalQues').val());
    });
    /*$('#unitMark').on('change',function(){
        var quesNo=$('#quesNo').text();
        $('#totalMarks').val(quesNo*($('#unitMark').val()));
    });*/
    $('#testIDList').on('change',function(){
        console.log($('#testIDList').val());
        $.ajax({
            url: "/test_available_check/",
            type: "GET",
            data:{'test_id':$('#testIDList').val()},
            dataType:"JSON",
            success: function(response) {
                if(response.results[0]=='2'){
                    console.log("Ok");
                }
                else{
                    $("#subjectList").prop('disabled',true);
                    $("#testTypeList").prop('disabled',true);
                    $("#testIDList").readonly();
                    $("#testName").val(response.results[0].test_name).prop('disabled',true);
                    $("#testTotalQues").val(response.results[0].test_total_questions).prop('disabled',true);
                    $("#totalMarks").val(response.results[0].test_totalmarks);
                    $("#totalTime").val(response.results[0].test_totaltimes).prop('disabled',true);
                    $("#unitMark").prop('disabled',true);
                    $("#editTestBtn").prop('disabled',false);
                    $("#submitTestBtn").prop('disabled',true);
                }
            }
        });
    });
    $('#editTestBtn').on('click',function(){
        $("#testName").prop('disabled',false);
//        $("#testTotalQues").val('').prop('disabled',false);
//        $("#totalMarks").val('');
        $("#totalTime").prop('disabled',false);
//        $("#unitMark").prop('disabled',false);
        $("#submitTestBtn").prop('disabled',false);
        $(this).prop('disabled',true);
        $("#mode").val(1);
    });

    $("#testSectionForm").validate({
        onkeyup: false,
        rules: {
            subjectList:{
                required: true,
            },
            testTypeList:{
                required: true,
            },
            testIDList: {
                required: true
            },
            testName: {
                required: true,
                minlength: 3,
//                remote: "/testname_Check/"
                remote: {
                    param: {
                        url: "/testname_Check/",
                        data:{'test_id': function() {
                            return $( "#testIDList" ).val();
                          }}
                    }/*,
                    depends: function(element) {
                        return ($('#mode').val() !== '1');
                    }*/
                }
            },
            testTotalQues: {
                required: true
            },
            /*unitMark: {
                required: true,
                digits: true
            },*/
            totalMarks: {
                required: false
            },
            totalTime: {
                required: true,
                digits: true
            },
            mode: {
                required: false
            },
        },submitHandler: function(form) {
            $.ajax({
                type: $(form).attr('method'),
                url: /test_submit/,
                data: $(form).serialize(),
                success: function(response) {
                    if(response.status==1){
                        swal("Success!", "Successfully Updated!", "success");
                        enable();
                        //$("#testSectionForm")[0].reset();
                        resetTestSection();
                        $("#quesNo").text('');
                    }
                    else if(response.status==2){
                        swal("Success!", "Successfully Inserted!", "success");
                        enable();
                        resetTestSection();
                    }
                    else{
                        swal("Error!", "Something Wrong!", "error");
                    }
                }
            });
        }
    });

    /*$('#submitTestBtn').on('click',function(){
        console.log($('#mode').val());
        $.ajax({
            url: "/test_submit/",
            type: "POST",
            data:{  'subject_id':$('#subjectList').val(),
                    'test_type':$('#testTypeList').val(),
                    'test_id':$('#testIDList').val(),
                    'test_name':$('#testName').val(),
                    'test_total_questions':$('#testTotalQues').val(),
                    'total_marks':$('#totalMarks').val(),
                    'total_time':$('#totalTime').val(),
                    'mode':$('#mode').val(),
                    'csrfmiddlewaretoken' : $("input[name=csrfmiddlewaretoken]").val()},
            dataType:"JSON",
            success: function(response) {
                if(response.status==1){
                    swal("Success!", "Successfully Updated!", "success");
                    enable();
                    $("#testSectionForm")[0].reset();
                    $("#quesNo").text('');
                }
                else if(response.status==2){
                    swal("Success!", "Successfully Inserted!", "success");
                }
                else{
                    swal("Error!", "Something Wrong!", "error");
                }
            }
        });
    });*/
    $('#resetBtn').on('click',function(){
        resetTestSection();
        enable();
        $('#quesNo').text("");
        $("#totalMarks").prop('readonly',true);
        $("#submitTestBtn").prop('disabled',false);
        $("#editTestBtn").prop('disabled',true);
    });

    function resetTestSection(){
        var validator = $( "#testSectionForm" ).validate();
        validator.resetForm();
        $("input[type=text]").val("");
        $('#quesNo').text("");
        $("select").prop('selectedIndex',0);
        $(":input").closest('.form-group').removeClass('has-success');
    }

    function enable() {
        $("#testIDList").readonly(false);
        $('input:disabled, select:disabled').each(function () {
           $(this).removeAttr('disabled');
        });
    }

    function getTestType(){
        $.ajax({
            url: "/test_type/",
            type: "GET",
            dataType:"JSON",
            success: function(response) {
                $("#testTypeList").find('option').not(':first').remove();
                if(response.length!=0){
                    $.each(response.results,function(index,row){
                        $("#testTypeList")
                        .append(
                            $("<option></option>")
                                .text(row.test_type_name)
                                .val(row.test_type_id)
                        );
                    });/*
                    $.each(response.quesNoResult,function(index,row){
                        $("#testTotalQues")
                        .append(
                            $("<option></option>")
                                .text(row.test_ques_no)
                                .val(row.test_ques_no)
                        );
                    });*/
                }
            }
        });
    }

    function getTestQuesNo(test_type){
        $.ajax({
            url: "/test_ques_no/",
            type: "GET",
            data: {'test_type':test_type},
            dataType:"JSON",
            success: function(response) {
                $("#testTotalQues").find('option').not(':first').remove();
                if(response.length!=0){
                    $.each(response.quesNoResult,function(index,row){
                        $("#testTotalQues")
                        .append(
                            $("<option></option>")
                                .text(row.test_ques_no)
                                .val(row.test_ques_no)
                        );
                    });
                }
            }
        });
    }
});