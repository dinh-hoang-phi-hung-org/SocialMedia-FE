"use client";

import { useState, useEffect, useCallback } from "react";
import { FaSearch } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import LabelShadcn from "../../ui/LabelShadcn";
import { useSidebarState } from "../../MainLayout/MainLayout";
import { useTranslation } from "react-i18next";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { TUser } from "@/shared/types/common-type/user-type";
import { useRouter } from "next/navigation";
const DEBOUNCE_DELAY = 500;
const RECENT_SEARCHES_KEY = "recent_searches";
const MAX_RECENT_SEARCHES = 5;

const Search = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<TUser[]>([]);
  const [searchResults, setSearchResults] = useState<TUser[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const { setIsSearchActive } = useSidebarState();

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const loadRecentSearches = () => {
      try {
        const savedSearches = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (savedSearches) {
          const parsedSearches = JSON.parse(savedSearches);
          setRecentSearches(parsedSearches);
        }
      } catch (error) {
        console.error("Error loading recent searches:", error);
        // If there's an error parsing, reset the localStorage
        localStorage.removeItem(RECENT_SEARCHES_KEY);
      }
    };

    loadRecentSearches();
  }, []);

  // Save recent searches to localStorage whenever it changes
  useEffect(() => {
    if (recentSearches.length > 0) {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
    }
  }, [recentSearches]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Handle search query changes
  useEffect(() => {
    // If search query is empty, hide search results with a slight delay for smooth transition
    if (!searchQuery) {
      const timer = setTimeout(() => {
        setShowSearchResults(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowSearchResults(true);
    }
  }, [searchQuery]);

  // Perform search when debounced query changes
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      console.log("Searching API for:", query);

      const results = await TypeTransfer["User"]?.otherAPIs?.getUsers({
        page: 1,
        limit: 10,
        searchFields: "username,first_name,last_name",
        searchValue: query,
      });

      setSearchResults(results?.payload?.data || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    performSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const handleClearInput = () => {
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const handleCloseSearch = () => {
    setIsSearchActive(false);
  };

  const handleUserClick = (user: TUser) => {
    if (!recentSearches.some((item) => item.uuid === user.uuid)) {
      const updatedSearches = [user, ...recentSearches].slice(0, MAX_RECENT_SEARCHES);
      setRecentSearches(updatedSearches);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedSearches));
    }

    router.push(`/profile/${user.uuid}`);
  };

  return (
    <div className="h-full overflow-auto no-scrollbar">
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold">
            <LabelShadcn text="common:path.search" translate className="font-bold text-primary-purple text-[1.2rem]" />
          </h1>
          <button onClick={handleCloseSearch} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <IoClose className="w-5 h-5 text-primary-purple" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-primary-purple text-sm"
              placeholder={t("common:text.search-users")}
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearInput}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <IoClose className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </form>

        <div className="relative flex-grow">
          {/* Search Results */}
          <AnimatePresence mode="wait">
            {showSearchResults ? (
              <motion.div
                key="search-results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 w-full"
              >
                <div className="mb-6">
                  <LabelShadcn
                    text="common:text.search-results"
                    translate
                    className="font-semibold text-[0.95rem] text-primary-purple mb-2 block"
                  />

                  {isSearching ? (
                    <div className="flex justify-center py-4">
                      <div className="w-6 h-6 border-2 border-primary-purple border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : searchResults?.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((user) => (
                        <motion.div
                          key={user.uuid}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleUserClick(user)}
                        >
                          <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-200">
                            <Image
                              src={user.profilePictureUrl || "/assets/images/sample-avatar.jpeg"}
                              alt={user.username || ""}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.username}</p>
                            <p className="text-xs text-gray-500">
                              {user.firstName} {user.lastName}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : debouncedSearchQuery ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      <p>{t("common:text.no-results")}</p>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="recent-searches"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 w-full"
              >
                {/* Recent Searches */}
                <div className="mb-4 flex justify-between items-center">
                  <LabelShadcn
                    text="common:text.recent-searches"
                    translate
                    className="font-semibold text-[0.95rem] text-primary-purple"
                  />
                  {recentSearches.length > 0 && (
                    <button onClick={handleClearRecent} className="text-sm text-primary-purple hover:underline">
                      <LabelShadcn text="common:text.clear-all" translate className="text-[0.9rem] cursor-pointer" />
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {recentSearches.length > 0 ? (
                    <div className="space-y-3">
                      {recentSearches.map((user) => (
                        <motion.div
                          key={user.uuid}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleUserClick(user)}
                        >
                          <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-200">
                            <Image
                              src={user.profilePictureUrl || "/assets/images/sample-avatar.jpeg"}
                              alt={user.username || ""}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.username}</p>
                            <p className="text-xs text-gray-500">
                              {user.firstName} {user.lastName}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-10 text-gray-500"
                    >
                      <p>
                        <LabelShadcn text="common:text.no-recent-searches" translate />
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Search;
