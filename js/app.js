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
                $("#welcome-name").html(results[0]['fname']);
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


let viewTaskController = (taskId, taskName, taskNotes, taskPriority, taskCreated, taskDueDate, taskStatus) => {
    $("#view_task_id").val(taskId);
    $("#view_task_name").html(taskName);
    $("#view_task_notes").html(taskNotes);
    $("#edit_task_id").val(taskId);
    $("#edit_taskname").val(taskName);
    $("#edit_tasknotes").val(taskNotes);
    $("#edit_taskpriority").val(taskPriority);
    $("#edit_taskduedate").val(taskDueDate);
    $("#edit_taskstatus").val(taskStatus);

    let prioritylabel = "";
    if (taskPriority == "high") {
        prioritylabel = '<span class="badge" style="background-color:#dc3545;">🔴 High</span>';
    }
    if (taskPriority == "medium") {
        prioritylabel = '<span class="badge" style="background-color:#ffc107; color:#000;">🟡 Medium</span>';
    }
    if (taskPriority == "low") {
        prioritylabel = '<span class="badge" style="background-color:#28a745;">🟢 Low</span>';
    }
    $("#view_task_priority").html(prioritylabel);

    let statuslabel = "";
    if (taskStatus == "complete") {
        statuslabel = '<span class="badge" style="background-color:#28a745;">✅ Complete</span>';
    }
    if (taskStatus == "in-progress") {
        statuslabel = '<span class="badge" style="background-color:#17a2b8;">🔄 In Progress</span>';
    }
    if (taskStatus == "pending") {
        statuslabel = '<span class="badge" style="background-color:#6c757d;">⏳ Pending</span>';
    }
    $("#view_task_status").html(statuslabel);

    let dateobj = new Date(taskCreated);
    let dateoptions = { year: 'numeric', month: 'long', day: 'numeric' };
    let formatteddate = dateobj.toLocaleDateString('en-US', dateoptions);
    $("#view_task_created").html("Created on " + formatteddate);

    if (taskDueDate != null && taskDueDate != "" && taskDueDate != "null") {
        let duedateobj = new Date(taskDueDate);
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        let dueoptions = { year: 'numeric', month: 'long', day: 'numeric' };
        let formattedduedate = duedateobj.toLocaleDateString('en-US', dueoptions);
        if (duedateobj < today) {
            $("#view_task_duedate").html('<span style="color:#dc3545;">⚠️ Overdue — was due ' + formattedduedate + '</span>');
        } else {
            $("#view_task_duedate").html(formattedduedate);
        }
    } else {
        $("#view_task_duedate").html('<span style="color:#aaa;">No due date set</span>');
    }

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

            let priorityorder = { 'high': 1, 'medium': 2, 'low': 3 };

            results.sort( function(a, b) {
                let duedatea = a['duedate'];
                let duedateb = b['duedate'];
                let prioritya = priorityorder[a['priority']];
                let priorityb = priorityorder[b['priority']];

                if (prioritya == undefined) {
                    prioritya = 2;
                }
                if (priorityb == undefined) {
                    priorityb = 2;
                }

                if (duedatea == null && duedateb == null) {
                    return prioritya - priorityb;
                }
                if (duedatea == null) {
                    return 1;
                }
                if (duedateb == null) {
                    return -1;
                }

                let datea = new Date(duedatea);
                let dateb = new Date(duedateb);

                if (datea < dateb) {
                    return -1;
                }
                if (datea > dateb) {
                    return 1;
                }
                return prioritya - priorityb;
            });

            let totalcount = results.length;
            let highcount = 0;
            let mediumcount = 0;
            let lowcount = 0;

            for (let x = 0; x < results.length; x++) {
                if (results[x]['priority'] == 'high') {
                    highcount++;
                }
                if (results[x]['priority'] == 'medium') {
                    mediumcount++;
                }
                if (results[x]['priority'] == 'low') {
                    lowcount++;
                }
            }

            $("#badge-total").html("📋 " + totalcount + " Total");
            $("#badge-high").html("🔴 " + highcount + " High");
            $("#badge-medium").html("🟡 " + mediumcount + " Medium");
            $("#badge-low").html("🟢 " + lowcount + " Low");

            completedTasksController();

            $.ajax({
                "url": endpoint01 + "/completedtasks",
                "method": "GET",
                "data": the_serialized_data,
                "success": (completedresults) => {
                    console.log(completedresults);
                    let completedcount = 0;
                    if (completedresults) {
                        completedcount = completedresults.length;
                    }
                    statsChartController(totalcount, highcount, mediumcount, lowcount, completedcount);
                },
                "error": (data) => {
                    console.log(data);
                    statsChartController(totalcount, highcount, mediumcount, lowcount, 0);
                }
            });

            $("#task-search").val("");

            for (let i = 0; i < results.length; i++) {
                let task = results[i];
                let taskname = task['taskname'];
                let tasknotes = task['tasknotes'];
                let taskid = task['taskid'];
                let createdts = task['createdts'];
                let duedate = task['duedate'];
                let status = task['status'];
                let priority = task['priority'];
                let prioritycolor = "#ffc107";
                let prioritylabeltext = "🟡 Medium";
                let prioritytextcolor = "#000";
                if (priority == "high") {
                    prioritycolor = "#dc3545";
                    prioritylabeltext = "🔴 High";
                    prioritytextcolor = "#fff";
                }
                if (priority == "low") {
                    prioritycolor = "#28a745";
                    prioritylabeltext = "🟢 Low";
                    prioritytextcolor = "#fff";
                }

                let prioritybadge = '<span class="badge me-1 priority-badge" ' +
                    'id="priority-badge-' + taskid + '" ' +
                    'style="background-color:' + prioritycolor + '; ' +
                    'color:' + prioritytextcolor + '; ' +
                    'font-size:0.75em; cursor:pointer;" ' +
                    'data-taskid="' + taskid + '" ' +
                    'data-priority="' + priority + '">' +
                    prioritylabeltext + '</span>';

                let duedatebadge = "";
                if (duedate != null && duedate != "" && duedate != "null") {
                    let duedateobj = new Date(duedate);
                    let today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (duedateobj < today) {
                        duedatebadge = '<span class="badge me-1" style="background-color:#dc3545; font-size:0.75em; cursor:default;">⚠️ Overdue</span>';
                    } else {
                        let dueoptions = { month: 'short', day: 'numeric' };
                        let duelabel = duedateobj.toLocaleDateString('en-US', dueoptions);
                        duedatebadge = '<span class="badge me-1" style="background-color:#6c757d; font-size:0.75em; cursor:default;">📅 ' + duelabel + '</span>';
                    }
                }

                let statuscolor = "#6c757d";
                let statuslabel = "⏳ Pending";
                if (status == "in-progress") {
                    statuscolor = "#17a2b8";
                    statuslabel = "🔄 In Progress";
                }
                if (status == "complete") {
                    statuscolor = "#28a745";
                    statuslabel = "✅ Complete";
                }

                let statusbadge = '<span class="badge me-1 status-badge" ' +
                    'id="status-badge-' + taskid + '" ' +
                    'style="background-color:' + statuscolor + '; ' +
                    'font-size:0.75em; cursor:pointer;" ' +
                    'data-taskid="' + taskid + '" ' +
                    'data-status="' + status + '">' +
                    statuslabel + '</span>';

                let row = '<tr>' +
                    '<td style="padding:8px 12px;">' +
                        '<div class="d-flex justify-content-between align-items-center">' +
                            '<span style="font-weight:500;">' + taskname + '</span>' +
                            '<button type="button" class="btn btn-sm options-btn" ' +
                            'style="background:none; border:none; color:#008080; font-size:0.9em;" ' +
                            'data-taskid="' + taskid + '" ' +
                            'data-taskname="' + taskname + '" ' +
                            'data-tasknotes="' + tasknotes + '" ' +
                            'data-priority="' + priority + '" ' +
                            'data-createdts="' + createdts + '" ' +
                            'data-duedate="' + duedate + '" ' +
                            'data-status="' + status + '">' +
                            '<i class="fa fa-sliders"></i> Options' +
                            '</button>' +
                        '</div>' +
                        '<div class="mt-1">' +
                            prioritybadge + duedatebadge + statusbadge +
                        '</div>' +
                    '</td>' +
                '</tr>';

                $("#tasks_table_body").append(row);
            }

            $('#tasks_table_body .options-btn').click( function() {
                let taskid = $(this).data('taskid');
                let taskname = $(this).data('taskname');
                let tasknotes = $(this).data('tasknotes');
                let priority = $(this).data('priority');
                let createdts = $(this).data('createdts');
                let duedate = $(this).data('duedate');
                let status = $(this).data('status');
                viewTaskController(taskid, taskname, tasknotes, priority, createdts, duedate, status);
            });

            $(document).off('click', '.status-badge');
            $(document).on('click', '.status-badge', function(e) {
                e.stopPropagation();

                $('.status-dropdown-menu').remove();

                let taskid = $(this).data('taskid');
                let currentstatus = $(this).data('status');
                let rect = this.getBoundingClientRect();
                let scrolltop = window.pageYOffset || document.documentElement.scrollTop;
                let scrollleft = window.pageXOffset || document.documentElement.scrollLeft;
                let toppos = rect.bottom + scrolltop + 4;
                let leftpos = rect.left + scrollleft;
                let menuheight = 120;

                if (rect.bottom + menuheight > window.innerHeight) {
                    toppos = rect.top + scrolltop - menuheight - 4;
                }

                let menu = '<div class="status-dropdown-menu card shadow" ' +
                    'style="position:absolute; ' +
                    'top:' + toppos + 'px; ' +
                    'left:' + leftpos + 'px; ' +
                    'z-index:9999; ' +
                    'min-width:150px; ' +
                    'padding:4px 0;">' +
                    '<div class="status-dropdown-item px-3 py-2" ' +
                    'style="cursor:pointer; font-size:0.9em;" ' +
                    'data-taskid="' + taskid + '" ' +
                    'data-newstatus="pending">⏳ Pending</div>' +
                    '<div class="status-dropdown-item px-3 py-2" ' +
                    'style="cursor:pointer; font-size:0.9em;" ' +
                    'data-taskid="' + taskid + '" ' +
                    'data-newstatus="in-progress">🔄 In Progress</div>' +
                    '<div class="status-dropdown-item px-3 py-2" ' +
                    'style="cursor:pointer; font-size:0.9em;" ' +
                    'data-taskid="' + taskid + '" ' +
                    'data-newstatus="complete">✅ Complete</div>' +
                    '</div>';

                $('body').append(menu);

                $('.status-dropdown-item').hover(
                    function() { $(this).css('background-color', '#f8f9fa'); },
                    function() { $(this).css('background-color', ''); }
                );
            });

            $(document).off('click', '.status-dropdown-item');
            $(document).on('click', '.status-dropdown-item', function(e) {
                e.stopPropagation();

                let taskid = $(this).data('taskid');
                let newstatus = $(this).data('newstatus');
                let token = localStorage.getItem("token");

                $('.status-dropdown-menu').remove();

                if (newstatus == "complete") {
                    let confirmed = confirm("Mark this task as complete? It will be removed from your task board.");
                    if (!confirmed) {
                        return;
                    }
                }

                let the_status_data = "token=" + encodeURIComponent(token) +
                    "&taskid=" + encodeURIComponent(taskid) +
                    "&status=" + encodeURIComponent(newstatus);

                $.ajax({
                    "url": endpoint01 + "/updatestatus",
                    "method": "PUT",
                    "data": the_status_data,
                    "success": (results) => {
                        console.log(results);

                        if (newstatus == "complete") {
                            $("#status-badge-" + taskid).closest('tr').fadeOut(300, function() {
                                $(this).remove();
                                let total = parseInt($("#badge-total").html().replace(/[^0-9]/g, ''));
                                let newtotal = total - 1;
                                $("#badge-total").html("📋 " + newtotal + " Total");
                            });
                            return;
                        }

                        let newcolor = "#6c757d";
                        let newlabel = "⏳ Pending";
                        if (newstatus == "in-progress") {
                            newcolor = "#17a2b8";
                            newlabel = "🔄 In Progress";
                        }
                        if (newstatus == "complete") {
                            newcolor = "#28a745";
                            newlabel = "✅ Complete";
                        }

                        $("#status-badge-" + taskid).html(newlabel);
                        $("#status-badge-" + taskid).css("background-color", newcolor);
                        $("#status-badge-" + taskid).data("status", newstatus);
                    },
                    "error": (data) => {
                        console.log(data);
                        $('#tasks_message').html("Failed to update status.");
                        $('#tasks_message').addClass("alert alert-danger");
                    }
                });
            });

            $(document).off('click', '.priority-badge');
            $(document).on('click', '.priority-badge', function(e) {
                e.stopPropagation();

                $('.priority-dropdown-menu').remove();
                $('.status-dropdown-menu').remove();

                let taskid = $(this).data('taskid');
                let rect = this.getBoundingClientRect();
                let scrolltop = window.pageYOffset || document.documentElement.scrollTop;
                let scrollleft = window.pageXOffset || document.documentElement.scrollLeft;
                let toppos = rect.bottom + scrolltop + 4;
                let leftpos = rect.left + scrollleft;
                let menuheight = 120;

                if (rect.bottom + menuheight > window.innerHeight) {
                    toppos = rect.top + scrolltop - menuheight - 4;
                }

                let menu = '<div class="priority-dropdown-menu card shadow" ' +
                    'style="position:absolute; ' +
                    'top:' + toppos + 'px; ' +
                    'left:' + leftpos + 'px; ' +
                    'z-index:9999; ' +
                    'min-width:150px; ' +
                    'padding:4px 0;">' +
                    '<div class="priority-dropdown-item px-3 py-2" ' +
                    'style="cursor:pointer; font-size:0.9em;" ' +
                    'data-taskid="' + taskid + '" ' +
                    'data-newpriority="high">🔴 High</div>' +
                    '<div class="priority-dropdown-item px-3 py-2" ' +
                    'style="cursor:pointer; font-size:0.9em;" ' +
                    'data-taskid="' + taskid + '" '}
                    'data-newpriority="medium">🟡 Medium</div>' +
                    '<div class="priority-dropdown-item px-3 py-2" ' +
                    'style="cursor:pointer; font-size:0.9em;" ' +
                    'data-taskid="' + taskid + '" ' +
                    'data-newpriority="low">🟢 Low</div>' +
                    '</div>';

                $('body').append(menu);

                $('.priority-dropdown-item').hover(
                    function() { $(this).css('background-color', '#f8f9fa'); },
                    function() { $(this).css('background-color', ''); }
                );
            });

            $(document).off('click', '.priority-dropdown-item');
            $(document).on('click', '.priority-dropdown-item', function(e) {
                e.stopPropagation();

                let taskid = $(this).data('taskid');
                let newpriority = $(this).data('newpriority');
                let token = localStorage.getItem("token");

                $('.priority-dropdown-menu').remove();

                let the_priority_data = "token=" + encodeURIComponent(token) +
                    "&taskid=" + encodeURIComponent(taskid) +
                    "&priority=" + encodeURIComponent(newpriority);

                $.ajax({
                    "url": endpoint01 + "/updatepriority",
                    "method": "PUT",
                    "data": the_priority_data,
                    "success": (results) => {
                        console.log(results);

                        let newcolor = "#ffc107";
                        let newlabel = "🟡 Medium";
                        let newtextcolor = "#000";
                        if (newpriority == "high") {
                            newcolor = "#dc3545";
                            newlabel = "🔴 High";
                            newtextcolor = "#fff";
                        }
                        if (newpriority == "low") {
                            newcolor = "#28a745";
                            newlabel = "🟢 Low";
                            newtextcolor = "#fff";
                        }

                        $("#priority-badge-" + taskid).html(newlabel);
                        $("#priority-badge-" + taskid).css("background-color", newcolor);
                        $("#priority-badge-" + taskid).css("color", newtextcolor);
                        $("#priority-badge-" + taskid).data("priority", newpriority);

                        let highcount = 0;
                        let mediumcount = 0;
                        let lowcount = 0;
                        $('.priority-badge').each( function() {
                            let p = $(this).data('priority');
                            if (p == "high") { highcount++; }
                            if (p == "medium") { mediumcount++; }
                            if (p == "low") { lowcount++; }
                        });
                        $("#badge-high").html("🔴 " + highcount + " High");
                        $("#badge-medium").html("🟡 " + mediumcount + " Medium");
                        $("#badge-low").html("🟢 " + lowcount + " Low");
                    },
                    "error": (data) => {
                        console.log(data);
                        $('#tasks_message').html("Failed to update priority.");
                        $('#tasks_message').addClass("alert alert-danger");
                    }
                });
            });

            $(document).on('click', function() {
                $('.priority-dropdown-menu').remove();
                $('.status-dropdown-menu').remove();
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
        table += '<thead>';
        table += '<tr>';
        table += '<th>First Name</th>';
        table += '<th>Last Name</th>';
        table += '<th>Task</th>';
        table += '<th>Priority</th>';
        table += '<th>Status</th>';
        table += '<th>Due Date</th>';
        table += '</tr>';
        table += '</thead>';
        table += '<tbody>';

        for (let i = 0; i < results.length; i++) {
            let row = results[i];
            let duedatedisplay = "None";
            if (row['duedate'] != null && row['duedate'] != "") {
                let duedateobj = new Date(row['duedate']);
                let dueoptions = { month: 'short', day: 'numeric', year: 'numeric' };
                duedatedisplay = duedateobj.toLocaleDateString('en-US', dueoptions);
            }
            table += '<tr>';
            table += '<td>' + row['fname'] + '</td>';
            table += '<td>' + row['lname'] + '</td>';
            table += '<td>' + row['taskname'] + '</td>';
            table += '<td>' + row['priority'] + '</td>';
            table += '<td>' + row['status'] + '</td>';
            table += '<td>' + duedatedisplay + '</td>';
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

let completedTasksController = () => {
    $('#completed-message').html("");
    $('#completed-message').removeClass();
    $("#completed-table-container").html("");

    let the_serialized_data = $("#form-tasks").serialize();
    console.log(the_serialized_data);

    $.ajax({
        "url": endpoint01 + "/completedtasks",
        "method": "GET",
        "data": the_serialized_data,
        "success": (results) => {
            console.log(results);

            $("#completed-count").html(results.length);

            if (!results || results.length == 0) {
                $('#completed-message').html('No completed tasks yet.');
                $('#completed-message').addClass("alert alert-info text-center");
                return;
            }

            let table = '<table class="table table-striped table-bordered" style="font-size:0.9em;">';
            table += '<thead>';
            table += '<tr>';
            table += '<th>Task</th>';
            table += '<th>Priority</th>';
            table += '<th>Completed</th>';
            table += '</tr>';
            table += '</thead>';
            table += '<tbody>';

            for (let i = 0; i < results.length; i++) {
                let row = results[i];
                let prioritybadge = '<span class="badge" style="background-color:#ffc107; color:#000; font-size:0.75em;">🟡 Medium</span>';
                if (row['priority'] == 'high') {
                    prioritybadge = '<span class="badge" style="background-color:#dc3545; font-size:0.75em;">🔴 High</span>';
                }
                if (row['priority'] == 'low') {
                    prioritybadge = '<span class="badge" style="background-color:#28a745; font-size:0.75em;">🟢 Low</span>';
                }

                let createddateobj = new Date(row['createdts']);
                let dateoptions = { month: 'short', day: 'numeric', year: 'numeric' };
                let formatteddate = createddateobj.toLocaleDateString('en-US', dateoptions);

                table += '<tr>';
                table += '<td>' + row['taskname'] + '</td>';
                table += '<td>' + prioritybadge + '</td>';
                table += '<td style="color:#888; font-size:0.85em;">' + formatteddate + '</td>';
                table += '</tr>';
            }

            table += '</tbody></table>';
            $("#completed-table-container").html(table);
        },
        "error": (data) => {
            console.log(data);
            $('#completed-message').html("Failed to load completed tasks.");
            $('#completed-message').addClass("alert alert-danger");
        }
    });
};

let chartinstance = null;

let statsChartController = (totalcount, highcount, mediumcount, lowcount, completedcount) => {
    let ctx = document.getElementById('statsChart');
    if (!ctx) {
        return;
    }

    if (chartinstance != null) {
        chartinstance.destroy();
    }

    chartinstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Total', 'High', 'Medium', 'Low', 'Completed'],
            datasets: [{
                label: 'Tasks',
                data: [totalcount, highcount, mediumcount, lowcount, completedcount],
                backgroundColor: [
                    '#008080',
                    '#dc3545',
                    '#ffc107',
                    '#28a745',
                    '#6c757d'
                ],
                borderRadius: 6,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
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
    $("#welcome-name").html(localStorage.getItem("fname"));
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

    /* what happens if the demo login link is clicked? */
    $('#btnDemoLogin').click( () => {
        $("#username").val("demo");
        $("#password").val("demo123");
        loginController();
    });

    /* what happens if the demo admin login link is clicked? */
    $('#btnDemoAdmin').click( () => {
        $("#username").val("demoadmin");
        $("#password").val("demoadmin123");
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
        let priority = $("#edit_taskpriority").val();
        $("#edit_task_id").val(taskid);
        $("#edit_taskname").val(taskname);
        $("#edit_tasknotes").val(tasknotes);
        $("#edit_taskpriority").val(priority);
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

    /* what happens if the task search input changes */
    $('#task-search').on('input', () => {
        let searchterm = $("#task-search").val();
        searchterm = searchterm.toLowerCase();
        $('#tasks_table_body tr').each( function() {
            let tasktext = $(this).text();
            tasktext = tasktext.toLowerCase();
            if (tasktext.indexOf(searchterm) === -1) {
                $(this).hide();
            } else {
                $(this).show();
            }
        });
    });

}); /* end the document ready event*/