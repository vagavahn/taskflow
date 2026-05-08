"use strict";

/* SOME CONSTANTS */
let endpoint01 = "https://aa1qqavwd8.execute-api.us-east-1.amazonaws.com/default/project5karabassis";
//let endpoint02 = "https://si4psjztm1.execute-api.us-east-2.amazonaws.com/default/project3din";
//let endpoint01 = "https://30tmwogma6.execute-api.us-east-1.amazonaws.com/default/project3shafer-solution";

/* SUPPORTING FUNCTIONS */

let loginController = () => {
    // Clear any previous messages
    $('#login_message').html("");
    $('#login_message').removeClass();

    // Client-side error trapping
    let username = $("#username").val();
    let password = $("#password").val();
    if (username == "" || password == "") {
        $('#login_message').html('The user name and password are both required.');
        $('#login_message').addClass("alert alert-danger text-center");
        return;
    }

    let the_serialized_data = $("#form-login").serialize();
    console.log(the_serialized_data);

    $.ajax({
        "url": endpoint01 + "/login",
        "method": "POST",
        "data": the_serialized_data,
        "success": (results) => {
            console.log(results);
            if (!results || Object.keys(results).length == 0) {
                $('#login_message').html("Login Failed. Try again.");
                $('#login_message').addClass("alert alert-danger text-center");
            } else {
                // Save token for future requests
                localStorage.setItem("token", results[0].lasttoken);
                console.log(localStorage.token)
                $("#formaddtasktoken").val(localStorage.token);
                $("#tasks_token").val(localStorage.token);
                $("#edit_token").val(localStorage.token);
                // Save admin status
                localStorage.setItem("isadmin", results[0]['isadmin']);
                localStorage.setItem("fname", results[0]['fname']);
                localStorage.setItem("lname", results[0]['lname']);
                localStorage.setItem("username", results[0]['username']);
                $("#nav-username-display").html(results[0]['fname']);
                $("#dropdown-fullname").html(results[0]['fname'] + " " + results[0]['lname']);
                $("#dropdown-username").html("@" + results[0]['username']);
                // Show/hide admin report nav
                if (localStorage.getItem("isadmin") == "Y") {
                    $("#nav-adminreport").show();
                    $("#dropdown-adminreport").show();
                } else {
                    $("#nav-adminreport").hide();
                    $("#dropdown-adminreport").hide();
                }
                // Hide all content wrappers and show div-tasks
                $(".content-wrapper").hide();
                $("#div-tasks").show();
                // Unlock secured content
                $(".secured").removeClass("locked");		
                $(".secured").addClass("unlocked");
                taskListController();
            }
        },
        "error": (data) => {
            console.log(data);
            $('#login_message').html("Login Failed. Try again.");
            $('#login_message').addClass("alert alert-danger text-center");
        }
    });

    $("html, body").animate({ scrollTop: "0px" });
};


let saveTaskController = () => {
    // Clear any previous messages
    $('#addtask_message').html("");
    $('#addtask_message').removeClass();

    // Client-side error trapping
    let token = localStorage.getItem("token");
    let taskname = $("#taskname").val();
    let tasknotes = $("#tasknotes").val();
    if (!token || taskname == "" || tasknotes == "") {
        $('#addtask_message').html('All fields are required.');
        $('#addtask_message').addClass("alert alert-danger text-center");

        setTimeout( () => {
            $('#addtask_message').html("");
            $('#addtask_message').removeClass();
        }, 3000);

        return;
    }

    let data = $("#form-addtask").serialize();
    console.log(data);

    $.ajax({
        "url": endpoint01 + "/task",
        "method": "POST",
        "data": data,
        "success": (results) => {
            console.log(results);
            // Clear form
            $("#taskname").val("");
            $("#tasknotes").val("");
            // Hide all content wrappers and show div-tasks
            $(".content-wrapper").hide();
            $("#div-tasks").show();
            taskListController();
        },
        "error": (data) => {
            console.log(data);
            $('#addtask_message').html("Failed to save task.");
            $('#addtask_message').addClass("alert alert-danger text-center");
        }
    });

    $("html, body").animate({ scrollTop: "0px" });
};


let viewTaskController = (taskId, taskName, taskNotes) => {
    $("#view_task_id").val(taskId);
    $("#view_task_name").html(taskName);
    $("#view_task_notes").html(taskNotes);

    $(".content-wrapper").hide();
    $("#div-viewtask").show();
};


let deleteTaskController = () => {
    let taskId = $("#view_task_id").val();
    let token = localStorage.getItem("token");

    if (!taskId || !token) {
        return;
    }

    let the_serialized_data = $("#form-tasks").serialize();
    the_serialized_data = the_serialized_data + "&taskid=" + encodeURIComponent(taskId);
    console.log(the_serialized_data);

    $.ajax({
        "url": endpoint01 + "/task",
        "method": "DELETE",
        "data": the_serialized_data,
        "success": (results) => {
            console.log(results);
            $(".content-wrapper").hide();
            $("#div-tasks").show();
            taskListController();
        },
        "error": (data) => {
            console.log(data);
            $('#tasks_message').html("Unexpected Error");
            $('#tasks_message').addClass("alert alert-danger");
        }
    });
};


let taskListController = () => {
    // Clear any previous messages
    $('#tasks_message').html("");
    $('#tasks_message').removeClass();
    // Clear the table
    $("#tasks_table_body").html("");

    let the_serialized_data = $("#form-tasks").serialize();
    console.log(the_serialized_data);

    $.ajax({
        "url": endpoint01 + "/tasks",
        "method": "GET",
        "data": the_serialized_data,
        "success": (results) => {
            console.log(results);

            if (!results || results.length == 0) {
                $('#tasks_message').html('No tasks found');
                $('#tasks_message').addClass("alert alert-info text-center");
                $("#table_header").hide();
                return;
            }

            $("#table_header").show();

            for (let i = 0; i < results.length; i++) {
                let task = results[i];
                let taskname = task['taskname'];
                let tasknotes = task['tasknotes'];
                let taskid = task['taskid'];

                let row = '<tr>' +
                    '<td class="align-middle" style="padding-left:12px;">' + 
                    taskname + 
                    '<button type="button" class="btn btn-sm options-btn float-end"' +
                    ' style="background:none; border:none; color:#008080; font-size:0.9em;"' +
                    ' data-taskid="' + taskid + '"' +
                    ' data-taskname="' + taskname + '"' +
                    ' data-tasknotes="' + tasknotes + '">' +
                    '<i class="fa fa-sliders"></i> Options</button>' +
                    '</td>' +
                '</tr>';

                $("#tasks_table_body").append(row);
            }

            $('#tasks_table_body .options-btn').click( function() {
                let taskid = $(this).data('taskid');
                let taskname = $(this).data('taskname');
                let tasknotes = $(this).data('tasknotes');
                viewTaskController(taskid, taskname, tasknotes);
            });
        },
        "error": (data) => {
            console.log(data);
            $('#tasks_message').html("Unexpected Error");
            $('#tasks_message').addClass("alert alert-danger");
        }
    });
};


let editTaskController = () => {
    // Clear any previous messages
    $('#edittask_message').html("");
    $('#edittask_message').removeClass();

    // Client-side error trapping
    let token = localStorage.getItem("token");
    let taskname = $("#edit_taskname").val();
    let tasknotes = $("#edit_tasknotes").val();
    if (!token || taskname == "" || tasknotes == "") {
        $('#edittask_message').html('All fields are required.');
        $('#edittask_message').addClass("alert alert-danger text-center");
        return;
    }

    let the_serialized_data = $("#form-edittask").serialize();
    console.log(the_serialized_data);

    $.ajax({
        "url": endpoint01 + "/task",
        "method": "PUT",
        "data": the_serialized_data,
        "success": (results) => {
            console.log(results);
            $(".content-wrapper").hide();
            $("#div-tasks").show();
            taskListController();
        },
        "error": (data) => {
            console.log(data);
            $('#edittask_message').html("Failed to update task.");
            $('#edittask_message').addClass("alert alert-danger text-center");
        }
    });

    $("html, body").animate({ scrollTop: "0px" });
};


let signupController = () => {
    // Clear any previous messages
    $('#signup_message').html("");
    $('#signup_message').removeClass();

    // Client-side error trapping
    let username = $("#signup_username").val();
    let password = $("#signup_password").val();
    let firstname = $("#signup_firstname").val();
    let lastname = $("#signup_lastname").val();
    if (username == "" || password == "" || firstname == "" || lastname == "") {
        $('#signup_message').html('All fields are required.');
        $('#signup_message').addClass("alert alert-danger text-center");
        return;
    }

    let the_serialized_data = $("#form-signup").serialize();
    console.log(the_serialized_data);

    $.ajax({
        "url": endpoint01 + "/signup",
        "method": "POST",
        "data": the_serialized_data,
        "success": (results) => {
            console.log(results);
            $(".content-wrapper").hide();
            $("#div-login").show();
            $("#login_message").html("Account created! Please log in.");
            $("#login_message").addClass("alert alert-success text-center");
        },
        "error": (data) => {
            console.log(data);
            $('#signup_message').html("Failed to create account.");
            $('#signup_message').addClass("alert alert-danger text-center");
        }
    });

    $("html, body").animate({ scrollTop: "0px" });
};


let adminReportController = () => {
    // Clear any previous messages
    $('#adminreport_message').html("");
    $('#adminreport_message').removeClass();

    let the_serialized_data = $("#form-tasks").serialize();
    console.log(the_serialized_data);

    $.ajax({
        "url": endpoint01 + "/adminreport",
        "method": "GET",
        "data": the_serialized_data,
        "success": (results) => {
    console.log(results);

        if (!results || results.length == 0) {
            $('#adminreport_message').html('No data found');
            $('#adminreport_message').addClass("alert alert-info text-center");
            return;
    }

        let table = '<table class="table table-striped table-bordered">';
        table += '<thead><tr><th>Last Name</th><th>First Name</th><th>Task Name</th><th>Task Notes</th></tr></thead>';
        table += '<tbody>';
        for (let i = 0; i < results.length; i++) {
            let row = results[i];
            table += '<tr>';
            table += '<td>' + row['lname'] + '</td>';
            table += '<td>' + row['fname'] + '</td>';
            table += '<td>' + row['taskname'] + '</td>';
            table += '<td>' + row['tasknotes'] + '</td>';
            table += '</tr>';
    }
        table += '</tbody></table>';
        $("#adminreport_table_container").html(table);

        },
        "error": (data) => {
            console.log(data);
            $('#adminreport_message').html("Unexpected Error");
            $('#adminreport_message').addClass("alert alert-danger");
        }
    });
};

let editProfileController = () => {
    $('#editprofile_message').html("");
    $('#editprofile_message').removeClass();

    let token = localStorage.getItem("token");
    let fname = $("#editprofile_fname").val();
    let lname = $("#editprofile_lname").val();
    let username = $("#editprofile_username").val();

    if (!token || fname == "" || lname == "" || username == "") {
        $('#editprofile_message').html('All fields are required.');
        $('#editprofile_message').addClass("alert alert-danger text-center");
        return;
    }

    let the_serialized_data = $("#form-editprofile").serialize();
    console.log(the_serialized_data);

    $.ajax({
        "url": endpoint01 + "/editprofile",
        "method": "PUT",
        "data": the_serialized_data,
        "success": (results) => {
            console.log(results);
            localStorage.setItem("fname", fname);
            localStorage.setItem("lname", lname);
            localStorage.setItem("username", username);
            $("#nav-username-display").html(fname);
            $("#dropdown-fullname").html(fname + " " + lname);
            $("#dropdown-username").html("@" + username);
            $('#editprofile_message').html("Profile updated successfully!");
            $('#editprofile_message').addClass("alert alert-success text-center");
        },
        "error": (data) => {
            console.log(data);
            $('#editprofile_message').html("Failed to update profile.");
            $('#editprofile_message').addClass("alert alert-danger text-center");
        }
    });
};

let changePasswordController = () => {
    $('#changepassword_message').html("");
    $('#changepassword_message').removeClass();

    let token = localStorage.getItem("token");
    let currentpassword = $("#current_password").val();
    let newpassword = $("#new_password").val();
    let confirmpassword = $("#confirm_password").val();

    if (!token || currentpassword == "" || newpassword == "" || confirmpassword == "") {
        $('#changepassword_message').html('All fields are required.');
        $('#changepassword_message').addClass("alert alert-danger text-center");
        return;
    }

    if (newpassword != confirmpassword) {
        $('#changepassword_message').html('New passwords do not match.');
        $('#changepassword_message').addClass("alert alert-danger text-center");
        return;
    }

    let the_serialized_data = $("#form-changepassword").serialize();
    console.log(the_serialized_data);

    $.ajax({
        "url": endpoint01 + "/changepassword",
        "method": "PUT",
        "data": the_serialized_data,
        "success": (results) => {
            console.log(results);
            $('#changepassword_message').html("Password updated successfully!");
            $('#changepassword_message').addClass("alert alert-success text-center");
            $("#current_password").val("");
            $("#new_password").val("");
            $("#confirm_password").val("");
        },
        "error": (data) => {
            console.log(data);
            $('#changepassword_message').html("Failed to update password.");
            $('#changepassword_message').addClass("alert alert-danger text-center");
        }
    });
};

//document ready section
$(document).ready( () => {

    $("html, body").animate({ scrollTop: "0px" });

    /* ----------------- start up navigation -----------------*/	
    /* controls what gets revealed when the page is ready     */

    /* this reveals the default page */

$(".secured").removeClass("unlocked");
$(".secured").addClass("locked");

if (localStorage.token){
    $(".secured").removeClass("locked");		
    $(".secured").addClass("unlocked");
    $("#div-tasks").show();
    $("#formaddtasktoken").val(localStorage.token);
    $("#tasks_token").val(localStorage.token);
    $("#edit_token").val(localStorage.token);
    $("#nav-username-display").html(localStorage.getItem("fname"));
    $("#dropdown-fullname").html(localStorage.getItem("fname") + " " + localStorage.getItem("lname"));
    $("#dropdown-username").html("@" + localStorage.getItem("username"));
    if (localStorage.getItem("isadmin") == "Y") {
        $("#nav-adminreport").show();
        $("#dropdown-adminreport").show();
    } else {
        $("#nav-adminreport").hide();
        $("#dropdown-adminreport").hide();
    }
    taskListController();
} else {
    $("#div-login").show();
}

    /* ------------------  basic navigation -----------------*/	
    /* this controls navigation - show / hide pages as needed */

    /* links on the menu */
    /* what happens if any of the navigation links are clicked? */
    $('.nav-link').click( () => {
        $("html, body").animate({ scrollTop: "0px" }); /* scroll to top of page */
        $(".navbar-collapse").collapse('hide'); /* explicitly collapse the navigation menu */
    });
        
    /* what happens if the link-viewtask anchor tag is clicked? */
    $('#link-viewtask').click( () => {
        $(".content-wrapper").hide(); 	/* hide all content-wrappers */
        $("#div-viewtask").show(); /* show the chosen content wrapper */
    });
        
    /* what happens if the link-addtask anchor tag is clicked? */
    $('#link-addtask').click( () => {
        $(".content-wrapper").hide(); 	
        $("#div-addtask").show(); 
    });

    /* what happens if the btn-addtask anchor tag is clicked? */
    $('#btnAddTask').click( () => {
        $(".content-wrapper").hide(); 	
        $("#div-addtask").show(); 
    });

    /* what happens if the link-home anchor tag is clicked? */
    $('#link-home').click( () => {
        $(".content-wrapper").hide(); 	
        $("#div-tasks").show(); 
    });

    /* what happens if the login button is clicked? */
    $('#btnLogin').click( () => {
        loginController();
    });

    /* what happens if the save task button is clicked? */
    $('#btnSaveTask').click( () => {
        saveTaskController();
    });

    /* what happens if the go back button is clicked in view task */
    $('#btnGoBack').click( () => {
        $(".content-wrapper").hide();
        $("#div-tasks").show();
    });

    /* what happens if the delete task button is clicked */
    $('#btnDeleteTask').click( () => {
        let taskname = $("#view_task_name").html();
        $("#delete-task-name-display").html(taskname);
        let deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
        deleteModal.show();
    });

    /* what happens if the cancel button is clicked in add task */
    $('#btnCancelTask').click( () => {
        $('.content-wrapper').hide();
        $('#div-tasks').show();
    });

    /* what happens if the edit task button is clicked */
    $('#btnEditTask').click( () => {
        let taskid = $("#view_task_id").val();
        let taskname = $("#view_task_name").html();
        let tasknotes = $("#view_task_notes").html();
        $("#edit_task_id").val(taskid);
        $("#edit_taskname").val(taskname);
        $("#edit_tasknotes").val(tasknotes);
        $(".content-wrapper").hide();
        $("#div-edittask").show();
    });

    /* what happens if the save edit button is clicked */
    $('#btnSaveEdit').click( () => {
        editTaskController();
    });

    /* what happens if the cancel edit button is clicked */
    $('#btnCancelEdit').click( () => {
        $('.content-wrapper').hide();
        $('#div-tasks').show();
    });

    /* what happens if the cancel task2 button is clicked */
    $('#btnCancelTask2').click(() => {
        $(".content-wrapper").hide();
        $("#div-tasks").show();
    });

    /* what happens if the cancel edit2 button is clicked */
    $('#btnCancelEdit2').click(() => {
        $(".content-wrapper").hide();
        $("#div-tasks").show();
    });

    /* what happens if the show signup button is clicked */
    $('#btnShowSignup').click( () => {
        $(".content-wrapper").hide();
        $("#div-signup").show();
    });

    /* what happens if the back to login button is clicked */
    $('#btnBackToLogin').click( () => {
        $(".content-wrapper").hide();
        $("#div-login").show();
    });

    /* what happens if the signup button is clicked */
    $('#btnSignup').click( () => {
        signupController();
    });

    /* what happens if the admin report link is clicked */
    $('#link-adminreport').click( () => {
        $(".content-wrapper").hide();
        $("#div-adminreport").show();
        adminReportController();
    });

    /* what happens if the print task button is clicked */
    $('#btnPrintTask').click( () => {
        window.print();
    });

    /* what happens if the quit button or logout link is clicked? */
    $('#btnQuit,#link-logout').click(() => {
        $(".content-wrapper").hide(); 	
        localStorage.removeItem("token");
        localStorage.removeItem("isadmin");
        localStorage.removeItem("fname");
        localStorage.removeItem("lname");
        localStorage.removeItem("username");
        window.location = "./index.html";
    });

    /* what happens if dropdown-home is clicked */
    $('#dropdown-home').click(() => {
        $(".content-wrapper").hide();
        $("#div-tasks").show();
    });

    /* what happens if dropdown-addtask is clicked */
    $('#dropdown-addtask').click(() => {
        $(".content-wrapper").hide();
        $("#div-addtask").show();
    });

    /* what happens if dropdown-adminreport is clicked */
    $('#dropdown-adminreport').click(() => {
        $(".content-wrapper").hide();
        $("#div-adminreport").show();
        adminReportController();
    });

    /* what happens if dropdown-editprofile is clicked */
    $('#dropdown-editprofile').click(() => {
        $("#editprofile_token").val(localStorage.getItem("token"));
        $("#editprofile_fname").val(localStorage.getItem("fname"));
        $("#editprofile_lname").val(localStorage.getItem("lname"));
        $("#editprofile_username").val(localStorage.getItem("username"));
        $(".content-wrapper").hide();
        $("#div-editprofile").show();
    });

    /* what happens if dropdown-changepassword is clicked */
    $('#dropdown-changepassword').click(() => {
        $("#changepassword_token").val(localStorage.getItem("token"));
        $(".content-wrapper").hide();
        $("#div-changepassword").show();
    });

    /* what happens if the dropdown logout button is clicked? */
    $('#dropdown-logout').click(() => {
        $(".content-wrapper").hide();
        localStorage.removeItem("token");
        localStorage.removeItem("isadmin");
        localStorage.removeItem("fname");
        localStorage.removeItem("lname");
        localStorage.removeItem("username");
        window.location = "./index.html";
    });

    /* what happens if the save profile button is clicked */
    $('#btnSaveProfile').click(() => {
        editProfileController();
    });

    /* what happens if the cancel profile button is clicked */
    $('#btnCancelProfile').click(() => {
        $(".content-wrapper").hide();
        $("#div-tasks").show();
    });

    /* what happens if the update password button is clicked */
    $('#btnUpdatePassword').click(() => {
        changePasswordController();
    });

    /* what happens if the cancel password button is clicked */
    $('#btnCancelPassword').click(() => {
        $(".content-wrapper").hide();
        $("#div-tasks").show();
    });

    /* what happens if the confirm delete button is clicked */
    $('#btnConfirmDelete').click( () => {
        let deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
        deleteModal.hide();
        deleteTaskController();
    });

}); /* end the document ready event*/