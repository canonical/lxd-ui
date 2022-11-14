#   Copyright (C) 2012 by Jeremy P. White <jwhite@codeweavers.com>
#
#   This file is part of spice-html5.
#
#   spice-html5 is free software: you can redistribute it and/or modify
#   it under the terms of the GNU Lesser General Public License as published by
#   the Free Software Foundation, either version 3 of the License, or
#   (at your option) any later version.
#
#   spice-html5 is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#   GNU Lesser General Public License for more details.
#
#   You should have received a copy of the GNU Lesser General Public License
#   along with spice-html5.  If not, see <http://www.gnu.org/licenses/>.
#

DESTDIR := $(if $(DESTDIR),$(DESTDIR),/)
datadir := $(if $(datadir),$(datadir),$(DESTDIR)/usr/share)
tag := $(if $(tag),$(tag),HEAD)

ifndef version
    version = $(shell git describe $(tag)| grep spice-html5 | sed 's/^spice-html5-//')
endif

source_for_rpm = $(HOME)/rpmbuild/SOURCES/spice-html5-$(version).tar.gz

.PHONY: usage spice-html5.spec package.json rpm tar gittar local git install

usage:
	@echo "This project does not normally need to be built.  See the README."
	@echo " "
	@echo "This Makefile is used for creating RPM packages and the package.json file used by npm."
	@echo " "
	@echo "Building an rpm: "
	@echo "  Invoke 'make local' to make an rpm with the current working directory,"
	@echo "  or 'make git' to make an rpm with the latest git HEAD."
	@echo "  You can specify an alternate source tarball like this:"
	@echo "    make source=/my/alternate/source local"
	@echo "  You can specify a specific git tag like this:"
	@echo "    make tag=my_specific_tag git"
	@echo "  Results generally go in ~/rpmbuild"
	@echo " "
	@echo "Preparing for an npm publish:"
	@echo "    make package.json"
	@echo "  where you can specify"
	@echo "    make tag=my_specific_tag package.json"
	@echo "  to prepare a particular release."


spice-html5.spec:
	sed -e "s/VERSION/$(version)/" < spice-html5.spec.in > spice-html5.spec

package.json:
	sed -e "s/VERSION/$(version)/" < package.json.in > package.json

tar:
	if [ "$(source)x" = "x" ] ; then \
	    tar -czf $(source_for_rpm) --exclude=.git --transform='s!^!spice-html5-$(version)/!' * ; \
	else \
	    cp $(source) $(source_for_rpm) ; \
	fi

gittar:
	if [ "$(source)x" = "x" ] ; then \
	    git archive --output=$(source_for_rpm) --prefix=spice-html5-$(version)/ $(tag) ; \
	else \
	    cp $(source) $(source_for_rpm) ; \
	fi

rpm: spice-html5.spec
	rpmbuild -ba spice-html5.spec

local: tar rpm

git: gittar rpm

install:
	find . \( -iname '*.html' -or -iname '*.js' -or -iname '*.css' \) -exec install --mode=644 -D {} $(datadir)/spice-html5/{} \;
