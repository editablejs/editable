import { createGlobalStyle } from 'styled-components'
import tw from 'twin.macro'
import '@docsearch/css'

export const AlgoliaStyle = createGlobalStyle`
  .DocSearch--active #__next {
  -webkit-filter: blur(0px);
  filter: blur(0px);
}
.DocSearch-SearchBar {
  ${tw`py-4 px-5`}
}
.DocSearch-Form {
  ${tw`rounded-lg shadow-inner text-sm bg-gray-10 outline-none h-auto focus-within:ring`}
}
html.dark .DocSearch-Form {
  ${tw`bg-gray-80`}
}
.DocSearch-Dropdown {
  ${tw`px-0 h-full max-h-full`}
}
.DocSearch-Commands {
  ${tw`w-full justify-between border-t border-border pt-4`}
}
html.dark .DocSearch-Commands {
  ${tw`border-border-dark`}
}
.DocSearch-Commands-Key {
  ${tw`shadow-none bg-gray-10 text-primary`}
}
.DocSearch-Logo {
  ${tw`pt-4 pb-2`}
}
.DocSearch-Label {
  ${tw`text-xs`}
}
.DocSearch-Footer {
  ${tw`flex-col-reverse items-start h-auto pb-2 px-5 shadow-none`}
}
html.dark .DocSearch-Footer {
  ${tw`bg-wash-dark`}
}
.DocSearch-Input {
  appearance: none !important;
  ${tw`py-3 text-sm leading-tight text-primary focus:outline-none`}
}
html.dark .DocSearch-Input {
  ${tw`text-primary-dark`}
}
.DocSearch-Hit a {
  ${tw`rounded-r-lg rounded-l-none shadow-none pl-5`}
}
.DocSearch-Hit-source {
  ${tw`uppercase tracking-wide text-sm text-secondary font-bold pt-0 pl-5 m-0`}
}
html.dark .DocSearch-Hit-source {
  ${tw`text-secondary-dark`}
}
.DocSearch-Dropdown ul {
  ${tw`mr-5`}
}
.DocSearch-Hit-title {
  ${tw`text-base text-primary font-normal text-ellipsis whitespace-nowrap overflow-hidden`}
}
html.dark .DocSearch-Hit-title {
  ${tw`text-primary-dark`}
}
.DocSearch-Hit-path {
  ${tw`font-normal`}
}
.DocSearch-LoadingIndicator svg,
.DocSearch-MagnifierLabel svg {
  width: 13px;
  height: 13px;
  ${tw`text-gray-30 mx-1`}
}
.DocSearch-Modal {
  margin: 0;
  ${tw`flex justify-between h-full max-w-xs rounded-r-lg rounded-l-none`}
}
.DocSearch-Cancel {
  ${tw`ml-0 pl-5 text-base text-link font-normal`}
}
@media (max-width: 1024px) {
  .DocSearch-Modal {
    ${tw`max-w-full`}
  }
  .DocSearch-Cancel {
    ${tw`inline-block`}
  }
  .DocSearch-Commands {
    ${tw`hidden`}
  }
  .DocSearch-Modal {
    ${tw`rounded-none`}
  }
}
.DocSearch-Search-Icon {
  height: 20px;
  width: 20px;
  stroke-width: 1.6;
  ${tw`text-gray-60`}
}
`
