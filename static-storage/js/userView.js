$(document).ready(function(){
    var userID=$('#profileUserID').html();
    $('#userLink').on('click',function(){
        $('#userListTbl').DataTable({
            destroy: true,
            ajax: {
                    "url": '/getUserList/',
                    "dataSrc": function ( json ) {
                            return json;
                        }
                    },
            columns: [
                { "data": "id" },
                { "data": "username" },
                { "data": "user_contact" },
                { "data": "email" },
                { "data": "is_active",
                    render: function (data, type, row) {
                        return data === true ?
                        data.toString().replace( data, 'Active' ) :
                        data.toString().replace( data, 'Inactive' );
                    }
                },
                { "data": "is_staff",
                    render: function (data, type, row) {
                        return data === true ?
                        data.toString().replace( data, 'Admin' ) :
                        data.toString().replace( data, 'User' );
                    }
                }
            ]
        });
        getUserStatusList();
        getUserTypeList();
    });

    $('#userListTbl tbody').on('click','tr', function(){
        var userTbl = $('#userListTbl').DataTable();
        var tData = userTbl.row( this ).data() ;
        var is_active = tData['is_active'] ? 1 : 0;
        var is_staff = tData['is_staff'] ? 1 : 0;
        if(tData['id']==userID){
            swal("Error!", "User can't change own status or type!", "error");
        }
        else{
            $('#userEditModal').modal('show');
            $('#userEditID').html(tData['id']);
            $('#userEditName').html(tData['username']);
            $('#userEditContact').html(tData['user_contact']);
            $('#userEditEmail').html(tData['email']);
            $('#userEditStatus').val(is_active);
            $('#userEditType').val(is_staff);
        }
    });

    $('#userEditBtn').on('click',function(){
        var userTbl = $('#userListTbl').DataTable();
        $.ajax({
            url: "/user_update/",
            type: "GET",
            data:{  'user_id':$('#userEditID').html(),
                    'is_staff':$('#userEditType').val(),
                    'is_active':$('#userEditStatus').val()
                 },
            dataType:"JSON",
            success: function(response) {
                if(response.status==1){
                    swal("Success!", "Successfully Updated!", "success");
                    $('#userEditModal').modal('hide');
                    userTbl.ajax.reload();
                }
                else{
                    swal("Error!", "Something Wrong!", "error");
                }
            }
        });
    });

    function getUserStatusList(){
        $.ajax({
            url: "/user_status/",
            type: "GET",
            dataType:"JSON",
            success: function(response) {
                $("#userEditStatus").find('option').not(':first').remove();
                if(response.length!=0){
                    $.each(response,function(index,row){
                        $.each(row, function(k, v){
                            $("#userEditStatus")
                            .append(
                                $("<option></option>")
                                    .text(v.status_name)
                                    .val(v.status_id ? 1:0)
                            );
                        });
                    });
                }
            }
        });
    }
    function getUserTypeList(){
        $.ajax({
            url: "/user_type/",
            type: "GET",
            dataType:"JSON",
            success: function(response) {
                $("#userEditType").find('option').not(':first').remove();
                if(response.length!=0){
                    $.each(response,function(index,row){
                        $.each(row, function(k, v){
                            $("#userEditType")
                            .append(
                                $("<option></option>")
                                    .text(v.type_name)
                                    .val(v.type_id ? 1:0)
                            );
                        });
                    });
                }
            }
        });
    }

    $('#profileLink').on('click',function(){
        /*$('.main_content').removeClass('col-md-6').addClass('col-md-8');*/
        $.ajax({
            url: "/pic_update/",
            type: "GET",
            success: function(newData){
                $('#picUpdateDiv').html(newData);
            }
        });
    });
    $('#profileImgDiv').on('click',function(){
        $('#picEditModal').modal('show');
    });

    $.validator.addMethod('filesize', function (value, element, param) {
        return this.optional(element) || (element.files[0].size <= param)
    }, 'File size must be less than 300KB');

    $("#picUpdateForm").validate({
        rules: {
            user_image: {
                required: true,
                extension: "jpg,jpeg,png,svg",
                filesize: 300000,
            }
        },
        submitHandler: function(form) {
            $.ajax({
                type: $(form).attr('method'),
                url: /pic_update_submit/,
                data: new FormData(form),
                mimeType: "multipart/form-data",
                contentType: false,
                cache: false,
                processData: false,
                success: function(response) {
                    $('#picEditModal').modal('hide');
                    $("#profileImgDiv").load(" #profileImgDiv").fadeIn(1000);
                    if(response.status=='1'){
                        swal("Success!", "Successfully Added!", "success");
                    }
                }
            });
        }
    });
    $("#profileSectionForm").validate({
        onkeyup: false,
        rules: {
            profileFirstName:{
                required: true,
                minlength: 3
            },
            profileLastName:{
                required: true,
                minlength: 3
            },
            profileUserContact: {
                digits: true,
                minlength: 11
            },
        },submitHandler: function(form) {
            $.ajax({
                type: $(form).attr('method'),
                url: /profile_update/,
                data: $(form).serialize(),
                success: function(response) {
                    if(response.status==1){
                        swal("Success!", "Successfully Updated!", "success");
                        resetProfileSection();
                    }else{
                        swal("Error!", "Something Wrong!", "error");
                        resetProfileSection();
                    }
                }
            });
        }
    });
    function resetProfileSection(){
        var validator = $( "#profileSectionForm" ).validate();
        validator.resetForm();
        $(":input").closest('.form-group').removeClass('has-success');
    }
});
