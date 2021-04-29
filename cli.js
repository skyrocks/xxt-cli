#!/usr/bin/env node

//备份备份备份

const program = require('commander');       //设计命令行
const download = require('download-git-repo');      //github仓库下载
const inquirer = require('inquirer');       //命令行答询
const handlebars = require('handlebars');       //修改字符
const ora = require('ora');         //命令行中加载状态标识
const chalk = require('chalk');     //命令行输出字符颜色
const logSymbols = require('log-symbols');      //命令行输出符号
const fs = require('fs');
const request = require('request');
const { resolve } = require("path");
const install = require("./utils/install");

// console.log(chalk.green(`
//                        xt cli 命令
// ------------------------------------------------------------
//     xt init <template name> projectName  |  初始化项目 
//     xt -V                                |  查看版本号    
//     xt -h                                |  查看帮助      
//     xt list                              |  查看模板列表  
//     xt download                          |  下载zip模板  
//  ------------------------------------------------------------
// `));

// 可用模板
const templates = {
   'v3a': {
       downloadUrl: 'github:skyrocks/v3a#main'
   }
}

// v3a list
program
    .command('list')
    .description('查看所有可用模板')
    .action(() => {
        console.log(chalk.green(`
               xt 模板
---------------------------------------------
        v3a   Vue3 Antd 模版
---------------------------------------------
        `))
    })

// init <template> <project>
program
    .command('init <template> <project>')
    .description('初始化项目模板')
    .action((templateName, projectName) => {
        let downloadUrl = templates[templateName].downloadUrl;
        //下载github项目，下载墙loading提示
        const spinner = ora('正在下载模板...').start();
        //第一个参数是github仓库地址，第二个参数是创建的项目目录名，第三个参数是clone
        download(downloadUrl, projectName, { clone: true }, err => {
            if (err) {
                console.log(logSymbols.error, chalk.red('项目模板下载失败\n   只能下载list列表中有的模板'));
                console.log(err);
            } else {
                spinner.succeed('项目模板下载成功');
                //命令行答询
                inquirer.prompt([
                    {
                        type: 'input',
                        name: 'name',
                        message: '请输入项目名称',
                        default: projectName
                    },
                    {
                        type: 'input',
                        name: 'description',
                        message: '请输入项目简介',
                        default: ''
                    },
                    {
                        type: 'input',
                        name: 'author',
                        message: '请输入作者名称',
                        default: ''
                    }
                ]).then(answers => {
                    //根据命令行答询结果修改package.json文件
                    let packageContent = fs.readFileSync(`${projectName}/package.json`, 'utf8');
                    let packageResult = handlebars.compile(packageContent)(answers);
                    fs.writeFileSync(`${projectName}/package.json`, packageResult);
                    console.log(packageResult)
                    console.log(logSymbols.success, chalk.green('项目初始化成功，开始下载依赖...'));
                    install({ cwd: `${resolve('./')}/${projectName}` }).then(data => {
                        console.log(logSymbols.success, chalk.green('项目依赖下载成功！'));
                    });
                    //用chalk和log-symbols改变命令行输出样式
                })
            }
        })
    })

 // -V|--version
program.version('1.0.0');  // -v|--version时输出版本号0.1.0

program.parse(process.argv);
