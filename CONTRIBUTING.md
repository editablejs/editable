# Contribution
Thank you for your interest in improving editable! We are a community-driven project and welcome all forms of contributions, from discussions and documentation to bug fixes and feature enhancements.

Please read this document to help streamline the process and save everyone's valuable time.

## Issues
No software is bug-free. So, if you got an issue, follow these steps:

- Search the [issue list](https://github.com/editablejs/editable/issues?utf8=%E2%9C%93&q=) for current and old issues.
  - If you find an existing issue, please vote for the issue by adding a "+1" reaction. We use this to help prioritize issues!
-  If none of that is helping, please create an issue.

## Reproducing
The best way to help figure out an issue you are having is to produce a
minimal reproduction using [our CodeSandbox](https://codesandbox.io/s/editablejs-323c3x?file=/index.js)

## Development Guide

### Initial Setup

#### pnpm

This repository uses pnpm workspaces, so you should install pnpm as your package manager. See the [installation guide](https://pnpm.io/installation).

#### Clone

```bash
git clone https://github.com/editablejs/editable.git
```

#### Install & Build

```bash
cd editable
pnpm install
pnpm build
```

### Development

#### Start development server

```bash
pnpm dev
```

#### Run lint
We use eslint for all code (including typescript code)

All you need to do is:

```bash
pnpm lint
```

#### Run tests
This command will run all the tests.

```bash
pnpm test
```

## Release Guide

This section is for anyone wanting a release. The current release
sequence is as follows:

- Commit your changes:
  - Linting, tests, and build should pass.
- Open a PR against `main` and
  [add a changeset](https://github.com/atlassian/changesets/blob/main/docs/adding-a-changeset.md).
- Merge the PR, triggering the bot to create a PR release.
- Review the final changesets.
- Merge the PR release, triggering the bot to release the updated
  packages on npm.

## Pull Requests (PRs)

We welcome all contributions.

### Reviewing PRs

**As a PR submitter**, you should reference the issue if there is one,
include a short description of what you contributed and, if it is a code
change, instructions for how to manually test out the change. This is
informally enforced by our
[PR template](https://github.com/editablejs/editable/blob/main/.github/PULL_REQUEST_TEMPLATE.md). If your PR is reviewed as only needing trivial changes (e.g. small typos
etc), and you have commit access then you can merge the PR after making
those changes.

**As a PR reviewer**, you should read through the changes and comment on
any potential problems. If you see something cool, a kind word never
hurts either! Additionally, you should follow the testing instructions
and manually test the changes. If the instructions are missing, unclear,
or overly complex, feel free to request better instructions from the
submitter. Unless the PR is a draft, if you approve the review and there
is no other required discussion or changes, you should also go ahead and
merge the PR.

## Issue Triage

If you are looking for a way to help the project, triaging issues is a
great place to start. Here's how you can help:

### Responding to questions
[Q&A](https://github.com/editablejs/editable/discussions/categories/q-a) is a
great place to help. If you can answer a question, it will help the
asker as well as anyone who has a similar question. Also in the future
if anyone has that same question they can easily find it by searching.
If an issue needs reproduction, you may be able to guide the reporter
toward one, or even reproduce it yourself using
[this technique](https://github.com/editablejs/editable/blob/main/CONTRIBUTING.md#reproductions).

### Triaging issues

Once you've helped out on a few issues, if you'd like triage access you
can help label issues and respond to reporters.

If an issue is a `bug`, and it doesn't have a clear reproduction that
you have personally confirmed, label it `needs reproduction` and ask the
author to try and create a reproduction, or have a go yourself.

### Closing Questions

- Duplicate issues should be closed with a link to the original.
- Unreproducible issues should be closed if it's not possible to
  reproduce them (if the reporter drops offline, it is reasonable to
  wait 2 weeks before closing).
- `bug`s should be closed when the issue is fixed and released.
- `feature`s, `maintenance`s, should be closed when released or if the
  feature is deemed not appropriate.
