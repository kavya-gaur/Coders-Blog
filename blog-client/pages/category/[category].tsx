import { fetchArticles, fetchCategories } from "@/http";
import {
  IArticle,
  ICategory,
  ICollectionResponse,
  IPagination,
  IQueryOptions,
} from "@/types";
import { GetServerSideProps } from "next";
import Head from "next/head";
import React from "react";
import { AxiosResponse } from "axios";
import Tabs from "@/components/Tabs";
import qs from "qs";
import ArticleList from "@/components/ArticleList";
import { capitalizeFirstLetter, debounce, makeCategory } from "@/utils";
import Pagination from "@/components/Pagination";
import { useRouter } from "next/router";
interface IPropType {
  categories: {
    items: ICategory[];
    pagination: IPagination;
  };
  articles: {
    items: IArticle[];
    pagination: IPagination;
  };
  slug: string;
}

const category = ({ categories, articles, slug }: IPropType) => {
  const formattedCategory = () => {
    return capitalizeFirstLetter(makeCategory(slug));
  };
  const { page, pageCount } = articles.pagination;
  const router = useRouter();
  const { category: categorySlug } = router.query;

  const handleSearch = (query: string) => {
    router.push(`/category/${categorySlug}/?search=${query}`);
    return;
  };
  return (
    <>
      <Head>
        <title>Coder's Blog {" " + formattedCategory()}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Tabs
        categories={categories.items}
        handleOnSearch={debounce(handleSearch, 500)}
      />
      <ArticleList articles={articles.items} />
      <Pagination
        page={page}
        pageCount={pageCount}
        redirectUrl={`/category/${categorySlug}`}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  console.log("doing api call....");

  const options: IQueryOptions = {
    populate: ["author.avatar"],
    sort: ["id:desc"],
    filters: {
      category: {
        Slug: query.category,
      },
    },
    pagination: {
      page: query.page ? +query.page : 1,
      pageSize: 1,
    },
  };

  if (query.search) {
    options.filters = {
      Title: {
        $containsi: query.search,
      },
    };
  }

  const queryString = qs.stringify(options);

  const { data: categories }: AxiosResponse<ICollectionResponse<ICategory[]>> =
    await fetchCategories();

  const { data: articles }: AxiosResponse<ICollectionResponse<IArticle[]>> =
    await fetchArticles(queryString);

  return {
    props: {
      categories: {
        items: categories.data,
      },
      articles: {
        items: articles.data,
        pagination: articles.meta.pagination,
      },
      slug: query.category,
    },
  };
};

export default category;
