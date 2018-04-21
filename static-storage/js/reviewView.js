$(document).ready(function(){
    $('#reviewLink').on('click',function(){
        $.ajax({
            url: "/reviewUserList/",
            type: "GET",
            dataType:"JSON",
            success: function(response) {
                $("#reviewUser").find('option').not(':first').remove();
                if(response.length!=0){
                    $.each(response,function(index,row){
                        $.each(row, function(k, v){
                            $("#reviewUser")
                            .append(
                                $("<option></option>")
                                    .text(v.user_id+': '+v.user__user__username)
                                    .val(v.user_id)
                            );
                        });
                    });
                }
            }
        });
    });
    $('#reviewUser').on('change',function(){
        $.ajax({
            url: "/getTestListReview/",
            type: "GET",
            data: {'user_id':$(this).val()},
            dataType:"JSON",
            success: function(response) {
                $("#reviewTest").find('option').not(':first').remove();
                if(response.length!=0){
                    $.each(response,function(index,row){
                        $.each(row, function(k, v){
                            $("#reviewTest")
                            .append(
                                $("<option></option>")
                                    .text(v.test_id.toString().substring(3, 5)+': '+v.test_id__test_name)
                                    .val(v.test_id)
                            );
                        });
                    });
                }
            }
        });
    });

    $('#reviewTest').on('change',function(){
        $.ajax({
            url: "/getUserAnswerReview/",
            type: "GET",
            data: {'user_id':$('#reviewUser').val(),
                   'test_id':$('#reviewTest').val()},
            dataType:"JSON",
            success: function(response) {
                console.log(response);
                if(response){
                    $("#reviewAnsTbl").find('tr').not(':first').remove();
                    var trHTML = '';
                    $.each(response,function(index,row){
                        $.each(row, function (key,value) {
                            trHTML+= '<tr id='+value.ques_id+'>'+
                            '<td><span>'+value.ques_sl_id+'</span><input type="text" class="form-control hidden" id="quesid" name="quesid" value="'+value.ques_id+'"></td>'+
                            '<td>'+value.ques+'</td>'+
                            '<td>'+value.user_answer+'</td>'+
                            /*'<td><input type="text" class="form-control reviewMark" id="reviewMark" name="mark"></td>'+*/
                            '<td><select class="form-control reviewMark" name="mark"></select></td>'+
                            '<td><input type="text" class="form-control" name="suggestions"></td></tr>';
                        });
                    });
                    $('#reviewAnsTbl').append(trHTML);
                    getRatingMarks();
                }
            }
        });
    });

    sum=0;
    $(document).on("blur", ".reviewMark", function(){
        /*sum=sum+parseInt($(this).val());
        $('#reviewTotalMarks').val(sum);*/
        var sum = 0;
        $('.reviewMark').each(function() {
            sum += Number($(this).val());
        });
        $('#reviewTotalMarks').val(sum);
    });

    $('#reviewSubmitBtn').on('click',function(){
        var data=[];
        $('#reviewAnsTbl').find('tr:not(:has(th))').each(function(){
            var id=$(this).attr('id');
            var row={};
            $(this).find(':input').each(function(){
                row[$(this).attr('name')]=$(this).val();
            });
            data.push(row);
        });
        console.log(data);
        $.ajax({
            url: "/review_submit/",
            type: "POST",
            data: {obj:JSON.stringify(data),
            'csrfmiddlewaretoken' : $("input[name=csrfmiddlewaretoken]").val(),
            'test_id':$('#reviewTest').val(),
            'user_id':$('#reviewUser').val(),
            'total_marks':$('#reviewTotalMarks').val()},
            dataType:"JSON",
            success: function(response) {
                console.log(response.status);
                if(response.status=='1'){
                    swal("Success!", "Successfully Updated!", "success");
                    resetReviewSection();
                }
                else{
                    swal("Error!", "Something Wrong!", "error");
                }
            }
        });
    });

    function getRatingMarks(){
        $.ajax({
            url: "/rating_marks/",
            type: "GET",
            data: {'test_id':$('#reviewTest').val()},
            dataType:"JSON",
            success: function(response) {
                if(response.length!=0){
                    resArr = [];
                    $.each(response,function(index,row){
                        $.each(row, function(k, v){
                            resArr.push(v);
                        });
                    });
                    $('.reviewMark').each(function(index,row){
                        for(var i=0; i<= resArr[index]; i++){
                             $(this).append($("<option></option>").text(i).val(i));
                        }
                    });
                }
            }
        });
    }

    function resetReviewSection(){
        var validator = $( "#reviewSectionForm" ).validate();
        validator.resetForm();
        $("input[type=text]").val("");
        $("textarea").val("");
        $("select").prop('selectedIndex',0);
        $(":input").closest('.form-group').removeClass('has-success');
        $("#reviewAnsTbl tbody>tr").remove();
    }

    $('#reviewResetBtn').on('click',function(){
        resetReviewSection();
    });
});