$(document).ready(function(){

    function successMsg(msgTxt){
        swal("Success!", msgTxt, "success");
    }

    function errorMsg(msgTxt){
        swal("Error!", msgTxt, "error");
    }

    $('#subjectLink').on('click',function(e){
        e.preventDefault();
        var $this = $(this);
        if($this.data('clicked')) {
            resetSubjectSection();
        }
        else{
            allSubjectListOnTbl();
            getTotalQuesNo();
        }
    });

    function allSubjectListOnTbl(){
        $.ajax({
            url: "/subject_list/",
            type: "GET",
            dataType:"JSON",
            success: function(response) {
                if(response){
                    $("#subjectEditTbl").find('tr').not(':first').remove();
                    var trHTML = '';
                    $.each(response.results,function(index,row){
                        trHTML +='<tr data-id="'+row.subject_id+'" data-subName="'+row.subject_name+'" data-mcq_total_test="'+row.mcq_total_test+'" data-essay_total_test="'+row.essay_total_test+'">'+
                        '<td data-id="'+row.subject_id+'">' + row.subject_id +'</td>'+
                        '<td>' + row.subject_name +'</td>'+
                        '<td>' + row.mcq_total_test +'</td>'+
                        '<td>' + row.essay_total_test +'</td>';
                    });
                    $('#subjectEditTbl').append(trHTML);
                }
            }
        });
    }

    function getTotalQuesNo(){
        $.ajax({
            url: "/total_ques_no/",
            type: "GET",
            dataType:"JSON",
            success: function(response) {
                $("#mcqTotalTest").find('option').not(':first').remove();
                if(response.length!=0){
                    $.each(response.mcqResults,function(index,row){
                        $("#mcqTotalTest")
                        .append(
                            $("<option></option>")
                                .text(row.mcq_total_test)
                                .val(row.mcq_total_test)
                        );
                    });
                    $("#essayTotalTest").find('option').not(':first').remove();
                    $.each(response.essayResults,function(index,row){
                        $("#essayTotalTest")
                        .append(
                            $("<option></option>")
                                .text(row.essay_total_test)
                                .val(row.essay_total_test)
                        );
                    });
                }
            }
        });
    }

    $('#subjectEditTbl').on('click','tr', function(e){
        e.preventDefault();
        $('#subjectID').val($(this).attr("data-id"));
        $('#subjectName').val($(this).attr("data-subName"));
        $('#mcqTotalTest').val($(this).attr("data-mcq_total_test"));
        $('#essayTotalTest').val($(this).attr("data-essay_total_test"));
    });

    $("#subjectSectionForm").validate({
        onkeyup: false,
        rules: {
            subjectID:{
                required: false,
            },
            subjectName:{
                required: true,
                minlength: 3,
                remote: "/subjectname_Check/"
            },
            mcqTotalTest: {
                required: true
            },
            essayTotalTest: {
                required: true
            }
        },submitHandler: function(form) {
            $.ajax({
                type: $(form).attr('method'),
                url: /subject_insert/,
                data: $(form).serialize(),
                success: function(response) {
                    if(response.status===1){
                        successMsg(response.msg);
                        allSubjectListOnTbl();
                        resetSubjectSection();
                    }
                    else{
                        errorMsg(response.msg);
                        resetSubjectSection();
                    }
                }
            });
        }
    });

    $('#subjectReset').on('click',function(e){
        e.preventDefault();
        var validator = $( "#subjectSectionForm" ).validate();
        validator.resetForm();
        $(":input").closest('.form-group').removeClass('has-success');
        resetSubjectSection();
    });

    function resetSubjectSection(){
        $("input[type=text]").val("");
        $("select").prop('selectedIndex',0);
        $(":input").closest('.form-group').removeClass('has-success');
    }

});
