# G. Tom Hopkins

Senior engineer (full stack, 9 years), not blocked, locked in, high agency, creating shareholder value. References Available upon request.

# Contact

[tom@githop.com](mailto:tom@githop.com)  
(513) 675 \- 4467  
[https\://githop.com](https://githop.com) \- [https\://github.com/githop](https://github.com/githop) \- [https\://linkedin.com/in/githop](https://linkedin.com/in/githop)

# Skills

Full Stack \- AI Assisted Engineer \- System Design \- Front End Architecture \- Event Driven Architecture \- Domain Driven Design \- Typescript \- Node \- Amazon Web Services \- Serverless \- SQL \- Microservices \- React \- Ruby on Rails \- Python \- Terraform \- Telemetry \- Linux \- Kubernetes

# Experience

| Senior Software Engineer II | Semgrep _Denver, Colorado_ | May 2026 \- Aug 2026 |
| :-------------------------- | :------------------------- | :------------------: |

- Senior engineer on the Scan Services team within the Scan Platform group.
- The Scan Platform maintains Semgrep’s internal Kubernetes cluster where customer scans execute, while the Scan Services team ensures scan results are searchable in near real-time upon completion. To achieve low-latency eventual consistency without dual-write overhead, we implemented a log-based Change Data Capture (CDC) pipeline; streaming PostgreSQL WAL events through Kafka to index results into OpenSearch.
- Designed a CLI benchmarking suite to model high-concurrency burst traffic, establishing cluster throughput ceilings and ensuring infrastructure readiness for the launch of Fast Incident Response (a product enabling rapid customer scans against newly disclosed CVEs).
- Act as a Mentor on the team to other teammates.
- Present lightning talks / demos to wider engineering organization to communicate our wins and progress
- Contributed migration design docs and implementation plan for high level data model overhaul for running scans.

| Senior Software Engineer II | Guild _Denver, Colorado_ | Dec 2020 \- May 2025 |
| :-------------------------- | :----------------------- | :------------------: |

- Senior engineer in the Payments pillar across several product teams (Sponsorship, Tuition Assistance, Determination Processing), with varying tech stacks (Ruby on Rails on Amazon Elastic Kubernetes Service, React, Typescript, Node JS, AWS Lambda, Aws SQS, AWS Fargate, AWS Batch, AWS SAM/CDK, Postgres on AWS RDS, Python, GraphQL)
- Key senior engineer on a cross functional team that shipped the “Member Level Billing” product: an event driven suite of microservices on AWS (node, typescript) and a react UI responsible for processing \>1B dollars of financial transactions annually. Lead front end architecture and development, collaborated on graphql schema and backend serverless application architecture (AWS Lambda / AWS Batch, AWS SQS, GraphQL), data model, and development.
- Lead engineer on several cross functional product initiatives (AIS Payment integration, Deferred Tuition, CDK / Node migration, SOC2 / WCAG 2.1 compliance) which successfully shipped new features and products. These efforts required collaborating with several teams across Guild, delivering clear communication backed by an Architectural Design Record (ADR) documenting the engineering effort, implementation plan, scope of impact, key stakeholders and decision makers.
- Contributed to internal culture by giving lightning talks at division all hands, contributing PRs to other codebases on other teams, mentored teammates, participated in hackathons, interviewed candidates, and developed AI assisted workflows, tools, and best practices for my team.

| Software Engineer | Blinker _Denver, Colorado_ | June 2020 \- Dec 2020 |
| :---------------- | :------------------------- | :-------------------: |

- Implemented code generation pipeline for use with Typescript, React and Apollo client, increased developer velocity with faster workflows.
- Architected and implemented Front end authentication and authorization for Blinker’s new market place SPA for both Production and developer environments
- Build, test, and maintain scalable software on an agile team.
- Pair and mentor junior team members.
- Interview and assess technical skills for prospective candidates in a variety of languages including Typescript, Javascript, Python, Elixir and Ruby.

| Software Engineer | Avero _Boulder, Colorado_ | Feb 2018 \- March 2020 |
| :---------------- | :------------------------ | :--------------------: |

- Avero engineering uses a microservice architecture with several tiers: a gRCP / protocol buffer based service layer (Java, Node), a BFF layer now using GraphQL with Apollo, and a front end stack including React and React Native for iOS and Android. Avero typically has small agile teams consisting of 4 or more engineers, 1 QA and 1 PM.
- A member of the Expo team responsible for creating new versions of the company’s most popular product: Avero Logbook, a log based productivity application, and delivered to customers new Android and iOS apps and a new desktop web experience using React and React Native.
- A member of the Fry team currently responsible for building a new event based reporting architecture and UI. The Fry team also successfully shipped an update to Avero’s authentication and authorization between web / mobile clients and backend services.
- Experience using React Hooks in production and various solutions for state management, including React context, x-state, redux and redux-observable.
- Animations using React Spring, and in general via CSS and JS.
- Optimizing React apps for production.
- GraphQL: schema design, authoring resolvers on the server and querying them client side via Apollo hooks in React.
- Emphasis on type safety across architecture layers via static type generation for Typescript Node servers and React clients written in Typescript.
- Automated developer tasks via custom tooling and CLI applications.

| Front End Engineer | In the Telling _Boulder, Colorado_ | Nov 2015 \- Feb 2018 |
| :----------------- | :--------------------------------- | :------------------: |

- Designed, implemented, and tested new features for Angular JS client app and Rails API server with MongoDB.
- Refactored Grunt based tooling to use webpack to allow for use of typescript within the codebase.
- Built internal tools for development team to facilitate testing, release and development (version control / release management / doc generation, source code / template generation, perf / stress testing and optimization)
- Collaborate with non-technical team members outside of agile team for product development (film editors, marketing / sales team)

| Full Stack Developer | Briebug Solutions _Lakewood, Colorado_ | Sept 2015 \- Sept 2015 |
| :------------------- | :------------------------------------- | :--------------------: |

- One month contract as consultant
- Implemented data visualizations Briebug’s international client’s Angular JS / PHP application.
- Toolchain includes NodeJS, AngularJS, Gulp, Karma/Mocha, MongoDB, PHP, MEAN stack, TDD

| Software Engineer | TrainHeroic _Boulder, Colorado_ | Dec 2014 \- June 2015 |
| :---------------- | :------------------------------ | :-------------------: |

- Contribute to day to day development on an agile team.
- Designed, developed, implemented gulp based build and optimization process for angular app.
- Established use of AngularJS best practices in client apps (Controller As syntax, Module pattern, nested views with ui-router..etc).
- Implemented automated build process in TeamCity
- Developed protractor testing plan for angular client apps.
- Led team discussion and adoption of internal style guide.

# Education

## Ohio University

Bachelor of Arts, Philosophy 2012

## Dev Bootcamp

Dev Bootcamp is an intense 12 week program designed to instill a foundation for a career in web development. In addition, DBC emphasises non-technical interpersonal skills such as team integration and engineering empathy.

# Projects

## Hopkins Home Video Archive

Skills: Opus 4.5, Gemini 3, Bun, Typescript, React, WhisperX, OpenCode, OpenTUI, vLLM, Retrieval-Augmented Generation (RAG), Hybrid Search, Entity Normalization, Container Orchestration

A December 2025 side project to test frontier model capabilities and agentic coding tools (Claude Opus 4.5, Gemini 3, opencode). I wanted to organize, classify, and build a search interface for 150 GB of family home videos. I developed a high-performance transcription pipeline to automate audio extraction and time-aligned subtitle and thumbnail generation, followed by a hybrid semantic search engine and RAG pipeline to enable natural language querying with precise video citations. Finally, I built a local inference orchestration TUI to manage open-source models on my own hardware, providing the self-hosted infrastructure for the entire system. [Github](https://github.com/githop/hopkins-video-archive)

## CAIC AI Tools

Skills: Typescript, Vercel AI SDK, React, Claude Code, Node, Cloudflare Workers

AI side project to learn how to integrate AI into applications which uses Colorado Avalanche Information Center as a data source. Structured as a typescript monorepo, there are a suite of packages and three applications. There is an application for generating AI summaries of avalanche incident reports as well as a tool calling application that can be used to query real time avalanche forecasts using custom built tools for interacting with CAIC data. The tool calling app also has a CLI and React UI Vibe coded with claude code using Vercel AI SDK, typescript and node. [Github](https://github.com/githop/cAIc), [React UI](https://github.com/githop/cf-caic)

## Gnarlybox AI Homelab

Skills: Linux, Proxmox, Containerization, Docker, Python

A custom built AI homelab PC hypervisor that runs with Proxmox VE. I built the gnarlybox to use as a sandbox to learn infrastructure skills (how to host LLMs, how to serve them, how to configure server hardware / GPUs for LLMs) and as a place to run AI experiments, and build applications that leverage AI in the stack. This gives me an ability to quickly (and cheaply) spin up linux VMs and run models locally to power AI applications like the CAIC AI tools above. My dedicated AI VM runs Debian linux, uses CUDA 12.x, and has access to an RTX-3090 via GPU pass through. I typically use llama-cpp or hf transformers to run models locally.

## Graphql Codegen Plugin Apollo Mocked Response

Skills: GraphQL, Typescript, Visitor Pattern, Breadth First Search, Recursion, Vite, Node, TDD, React

A plugin for graphql codegenerator that generates mocked responses for graphql queries or mutations for apollo client. The plugin works well with a codegen workflow and decreases test suite maintenance via automation. Authored in typescript, this plugin scans graphql client operations and will emit mock functions that can be passed to an apollo client MockedProvider for usage in unit tests. The generated mock functions are fully typesafe and accept overrides for customization, and are kept in sync with code as it changes. The plugin code visits nodes (BFS) of a GraphqlSchema AST, collects the relevant operations, objects and fields, and will apply transformations on them (with a Visitor), resulting in generated code and types that can be imported elsewhere. [Github](https://github.com/githop/graphql-codegen-apollo-mocked-response/tree/main)

# Talks

## Putting the AI in CAIC \- 2025

Presentation given at the April 2025 Boulder JS meetup and DenverScript August 2025 lightning talks.. My talk featured slides and live demos of one of the AI side projects I built to learn how tool calling works in AI chat applications. The talk covered how I reverse engineered an undocumented API in order to build a client that could be used in tool calling by an LLM. The talk featured my approach to using AI assisted engineering (vibe coding) to build the app itself. [BoulderJS presentation abstract](https://github.com/boulder-js/talks/issues/14#issue-2984261450), [DenverScript Meetup event link](https://www.meetup.com/denverscript/events/310125185/?eventOrigin=group_events_list)

# Other

| Partner Professional Studios | Head IT Coordinator | 2009 \- 2014 |
| :--------------------------- | :------------------ | :----------: |

Partner Professional Solutions is predominantly a Healthcare IT recruiting company based in Cincinnati, OH. Roles over tenure included: intern, sales-researcher, IT support, Head of IT. Responsibilities included vendor relations, policy formulation /implementation, admin / technical roles.
